# 工作作息配置升级：行业画像 + 工作日/周末 TOU（SelfConsumption 首版）

## TL;DR

> **目标**：在“光伏消纳分析 (Aligned Engine)”中引入“行业画像曲线模式”（24 点负荷占比，和=1，可选周末覆盖）作为默认负荷模型；并将分时规则（TimeConfig）扩展为“工作日/周末”两套规则（节假日首版按周末）。
>
> **关键点**：负荷画像（行业属性）与 TOU（政策属性）解耦；首版仅让 SelfConsumption 生效，不改其它模块的 24h 预览/综合电价计算。

**交付物**
- 行业画像库（内置 15 类 + 用户自定义 CRUD），持久化到 RxDB。
- TimeConfig 支持 weekday/weekend 两套 `TimeRule[]`（DB schema 迁移）。
- TimeConfigMatrix 支持编辑 weekday/weekend（UI 切换）。
- Aligned Engine 支持两种负荷模型：
  - 默认：画像曲线模式（逐小时按画像分配月总电量）
  - 兼容：旧 ABCD 模式（工作时段 A / 非工作时段 B / 休息日 C / 节假日 D + R_B/R_C/R_D）
- SelfConsumption 支持两种负荷导入：
  - 旧格式：按 TOU 分解的月电量（尖/峰/平/谷/深谷）
  - 新格式：月份 + 月总电量(kWh)

**预计工作量**：Large
**并行执行**：YES（2-3 waves）
**关键路径**：TimeConfig schema/matrix → Resolver/Aligned Engine weekday-weekend → Persona schema/library → SelfConsumption UI/导入 → 测试/回归

---

## Context

### 原始诉求（用户）
- “改一版工作作息配置”
- 增加不同行业的用户画像默认配置（10+ 类）
- 开放配置不同时段分时规则（首版：工作日/周末）
- 参考思路：只输出“典型日 24 点负荷占比（和为 1）”，与 TOU/电价解耦

### 已确认决策
- TOU 维度：区分工作日/周末
- 节假日：未来希望单独一套，但首版不做；首版节假日按周末 TOU
- 生效范围（首版）：仅 SelfConsumption / Aligned Engine 使用 weekday/weekend；其它模块保持现状
- 负荷模型：新增“画像曲线模式（默认）”，保留旧 ABCD 模式（兼容/高级）
- 行业画像曲线：工作日 24 点占比 + 可选周末覆盖；未配置周末则沿用工作日
- 画像库：做成可复用库并持久化 RxDB（内置默认 + 用户自定义 CRUD）
- 负荷导入：同时支持旧 TOU 月电量格式 + 新“月总电量(kWh)”简化格式
- 测试：要自动化测试（tests-after），框架为 Vitest + RTL

### 代码现状（证据）
- TimeConfig（TOU library）：`types.ts:18-26`，UI 编辑：`components/TimeConfigMatrix.tsx`（12x24 画板）
- Tariff snapshot TOU：`types.ts:28-42` 的 `TariffData.time_rules`（SmartUpload/ManualEntry 复制自 TimeConfig）
- SelfConsumption 8760：`components/SelfConsumption/index.tsx` + `services/consumptionAlignedService.ts`
  - 当前 TOU：仅按“月份”解析一套 24 小时网格（不区分工作日/周末）
  - 当前负荷：ABCD 四档 + R_B/R_C/R_D（每档小时功率常数）
- 负荷导入（SelfConsumption）：`utils/excelParser.ts`（只支持“按 TOU 分解的月电量”）
- 已存在（deprecated）总电量解析能力：`services/loadDataService.ts`（可解析月总/8760，但标注 deprecated）

---

## Work Objectives

### Core Objective
在不破坏现有电价库与自消费分析主流程的前提下：
1) 让用户用“行业画像曲线（24 点占比）”更真实地生成逐时负荷；2) 让 TOU 支持工作日/周末两套规则；3) 支持导入月总电量，彻底让“画像”与“TOU”解耦。

### Must Have
- Aligned Engine（SelfConsumption）可在工作日/周末使用不同 TOU（节假日按周末）
- 行业画像库可用（内置 15 类 + 自定义 CRUD），并可在 SelfConsumption 中选择、编辑、预览
- 新导入格式（月总电量）可用，并与画像曲线共同生成逐时负荷
- 旧 ABCD 模式与旧 TOU 月电量导入继续可用（兼容）

### Must NOT Have（Guardrails）
- 不改变 `components/Analysis.tsx` 的 24h 电价预览、`services/priceCalculator.ts` 的平均电价计算逻辑（首版不让它们理解 weekday/weekend）
- 不强制改变历史 TimeConfig / Tariff 数据；必须通过 DB migration 向后兼容
- 不引入后端；所有数据保持 local-first（RxDB）

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**：YES
- **Automated tests**：YES（tests-after）
- **Framework**：Vitest + React Testing Library（jsdom）
- **Commands**：`npm test`，`npx vitest path/to/file.test.ts[x]`

### Agent-Executed QA（强制）
- UI 变更用 Playwright 走通：TimeConfig weekday/weekend 编辑 → SelfConsumption 画像模式分析 → 导出/结果校验。
- 关键逻辑用 Vitest 单测覆盖：
  - weekday/weekend TimeConfig resolver
  - 画像曲线归一化与逐时分配
  - 新月总电量导入解析

---

## Execution Strategy（Parallel Waves）

Wave 1（可并行）
- A. 扩展 TimeConfig 数据模型 + RxDB migration（weekend rules）
- B. 新增 Persona（行业画像）collection + 默认种子

Wave 2（依赖 Wave 1）
- C. TimeConfigMatrix UI：weekday/weekend 编辑
- D. Resolver + Aligned Engine：按 dayType 取 TOU、按画像生成逐时负荷

Wave 3（依赖 Wave 2）
- E. SelfConsumption UI：负荷模型切换、画像选择/编辑、月总电量导入
- F. tests-after + 回归验证

---

## TODOs

> 每个任务都包含：实现要点、引用、验收标准、Agent-Executed QA 场景（可执行）。

### 1) TimeConfig 支持 weekday/weekend（类型 + RxDB schema 迁移）

**What to do**
- 扩展 `types.ts:TimeConfig` 增加可选字段（建议）：`weekend_time_rules?: TimeRule[]`
- 扩展 `services/db.ts` 的 timeConfigSchema：版本从 1 → 2，新增 `weekend_time_rules` 字段
- 迁移策略：老数据若缺失 `weekend_time_rules`，默认置空（表示“周末沿用工作日”）

**Must NOT do**
- 不改变既有 `time_rules` 的语义与存储

**Recommended Agent Profile**
- Category: `unspecified-high`
- Skills: （无强制技能）

**References**
- `types.ts:12-26`（TimeRule/TimeConfig 现定义）
- `services/db.ts`（time_configs collection schema + migrationStrategies）

**Acceptance Criteria**
- RxDB 打开已有数据时不报错（旧 time_configs 能正常读取）
- 新增字段存在于 schema 并可写入/读取

**QA Scenario（Bash）**
```
Scenario: DB migration does not break existing data
  Tool: Bash
  Steps:
    1. npm test
    2. npm run build
  Expected Result: tests/build pass
```

---

### 2) TimeConfig resolver 支持按 dayType 解析 weekday/weekend TOU

**What to do**
- 在 `utils/timeConfigResolver.ts` 增加 dayType 参数（或新增函数）以返回 weekday/weekend 各自 touGrid
- 在 SelfConsumption aligned engine 中：
  - `services/consumptionAlignedService.ts:193-209` 的 buildTouGridByMonth 改为生成双网格（weekday/weekend）
  - `getDayType()` 得到 `restday/holiday` 时使用 weekend grid（节假日首版按周末）

**Must NOT do**
- 不修改 `components/Analysis.tsx` / `services/priceCalculator.ts` 的使用方式（首版不扩散）

**Recommended Agent Profile**
- Category: `unspecified-high`
- Skills: （无强制技能）

**References**
- `utils/timeConfigResolver.ts`（当前按省份+月份 resolve）
- `services/consumptionAlignedService.ts:105-147`（dayType 判定与节假日逻辑）
- `services/consumptionAlignedService.ts:388-462`（逐时循环中分配 touType 的位置）

**Acceptance Criteria**
- 当某省份 TimeConfig 配置了 weekend_time_rules 时：
  - 同一月份的周末小时 `touType` 与工作日可不同
  - holiday 的 `touType` 与 weekend 一致
- 旧数据（无 weekend_time_rules）行为不变（周末=工作日）

**QA Scenario（Vitest）**
```
Scenario: Resolver returns different grids for weekend
  Tool: Bash
  Steps:
    1. npx vitest services/consumptionAlignedService.test.ts
  Expected Result: PASS
```

---

### 3) TimeConfigMatrix UI 增加 weekday/weekend 编辑切换

**What to do**
- 在 `components/TimeConfigMatrix.tsx` 增加一个切换控件（Tab/Segmented）：“工作日 / 周末”
- 保存逻辑：
  - 工作日编辑 → 写入 `time_rules`
  - 周末编辑 → 写入 `weekend_time_rules`
  - 若用户从未编辑周末：保持 `weekend_time_rules` 为空（表示沿用工作日）
- 显示逻辑：当切到周末且 `weekend_time_rules` 为空时，UI 显示“沿用工作日规则”的提示，并允许“一键从工作日复制”

**References**
- `components/TimeConfigMatrix.tsx`（现有 12x24 画板 + 保存）
- `utils/timeUtils.ts`（rulesToGrid/gridToRules）

**Acceptance Criteria**
- 用户可分别编辑并保存 weekday/weekend 两套规则
- 切换 Tab 不丢失未保存编辑（本地 state 保留）

**Agent-Executed QA Scenario（Playwright）**
```
Scenario: Edit weekend TOU and persist
  Tool: Playwright
  Preconditions: Dev server running
  Steps:
    1. Navigate to TimeConfig view (config)
    2. Open an existing province config
    3. Switch to "周末" tab
    4. Click "从工作日复制" (if shown)
    5. Paint hour 10-12 as "peak" for a summer month
    6. Save
    7. Reload page
    8. Re-open same config and verify weekend grid matches edits
    9. Screenshot: .sisyphus/evidence/task-3-weekend-tou-edit.png
  Expected Result: weekend rules persist and reload correctly
```

---

### 4) 新增行业画像 Persona collection（RxDB）+ 默认种子（15 类）

**What to do**
- 新增 RxDB collection（建议名）：`personas` / `load_personas`
- Schema 字段建议：
  - `id` (uuid)
  - `slug`（稳定键）
  - `name`（中文显示名）
  - `weekdayShares: number[24]`
  - `weekendShares?: number[24]`（可选；缺省表示沿用工作日）
  - `isDefault: boolean`
  - `updated_at`, `last_modified`, `_deleted?`
- 在 `constants.tsx`（或新文件）定义默认 15 类 persona 数据（曲线需归一化）
- 在 `App.tsx` DB init 时 seed：如果 collection 为空，则 bulkInsert 默认 persona
- 新增 `hooks/useDatabase.ts` 提供 `usePersonas()` 订阅

**Important note**
- 当前工程存在同名 `WorkSchedule` type 冲突：
  - `types.ts:341-348` 的 WorkSchedule（看似 DB preset）
  - `services/consumptionAlignedService.ts:19-27` 的 WorkSchedule（engine input）
  需要在实现时统一/重命名，避免 TS import 误用（见任务 4.1）。

**References**
- `services/db.ts`（新增 collection 的位置与 schema 模式）
- `App.tsx`（参考 holidays/time_configs 的 init/订阅/迁移）
- `hooks/useDatabase.ts`（新增订阅 hook）

**Acceptance Criteria**
- 首次打开（空 DB）会自动生成 15 个默认 persona
- persona 支持增删改查，且通过 RxDB 备份/恢复保留

---

### 4.1) 清理 `WorkSchedule` 类型冲突（避免实现时踩坑）

**What to do**
- 明确两类概念并重命名：
  - 引擎输入：`services/consumptionAlignedService.ts` 的 `WorkSchedule` → 建议改名 `AlignedWorkSchedule`（或 `WorkScheduleInput`）
  - DB/其它用途：`types.ts:341-348` 的 `WorkSchedule` 若仍需保留，改名 `WorkSchedulePreset`（或删除未使用的旧定义）
- 全项目引用跟随重命名（包含 `components/SelfConsumption/index.tsx` 的 import）

**References**
- `services/consumptionAlignedService.ts:19-27`
- `types.ts:341-348`
- `components/SelfConsumption/index.tsx:17-23`

**Acceptance Criteria**
- TS 编译无同名类型混淆；import 明确且不会误用

---

**QA Scenario（Bash + UI）**
```
Scenario: Persona seeding + CRUD
  Tool: Bash + Playwright
  Steps:
    1. Start dev server
    2. Open persona manager UI
    3. Verify default personas list length >= 15
    4. Create a new custom persona "自定义-测试"
    5. Edit one hour share and save
    6. Reload and verify it persists
```

---

### 5) Aligned Engine 增加“画像曲线模式”逐时负荷生成（并保留 ABCD 模式）

**What to do**
- 在 `services/consumptionAlignedService.ts` 增加一种负荷生成路径：
  - 输入：每月总电量（从旧 TOU 月电量求和，或来自新总电量导入）
  - 根据每一天 dayType（workday/restday/holiday）选择曲线：
    - workday → weekdayShares
    - restday/holiday → weekendShares（若缺失则用 weekdayShares）
  - 将月总电量按“该月所有小时权重之和”归一化后分配到每个小时
- 保留并可切换旧 ABCD 模式（不改其计算结果）
- 处理边界：
  - shares 必须校验长度=24、>=0、sum>0；否则给 warning 并回退为均匀 1/24
  - 明确“标准年”仍是 `BASE_YEAR = 2021`（与现逻辑一致）

**References**
- `services/consumptionAlignedService.ts:101-147`（dayType/level 判定）
- `services/consumptionAlignedService.ts:291-482`（主引擎循环）
- `components/SelfConsumption/index.tsx:98-106`（当前 workSchedule state）

**Acceptance Criteria**
- Persona 模式下：每月逐时 loadKwh 汇总 = 输入月总电量（误差容许 1e-6 浮点）
- Persona 模式下：周末/节假日按 weekend curve 分配（缺省则沿用 weekday curve）
- ABCD 模式仍可用且结果不回归

**QA Scenario（Vitest）**
```
Scenario: Persona distribution conserves monthly total
  Tool: Bash
  Steps:
    1. npx vitest services/consumptionAlignedService.test.ts
  Expected Result: PASS
```

---

### 6) SelfConsumption：UI 改版（负荷模型切换 + 行业画像选择/编辑 + 周末覆盖）

**What to do**
- 在 `components/SelfConsumption/index.tsx` 的“工作作息配置”区域：
  - 增加“负荷模型”切换：`画像曲线（默认） / ABCD（兼容）`
  - Persona 模式显示：行业画像选择器（默认从 persona 库选）、24 点编辑器、可选“周末覆盖”编辑器、预览（典型日曲线）
  - ABCD 模式保留现有输入（工作时间、休假模式、R_B/R_C/R_D、节假日选择）
- Persona 模式仍保留“休假模式 + 节假日选择”（用于 dayType 判定）

**References**
- `components/SelfConsumption/index.tsx:602-684`（现有工作作息配置 UI 段落）
- `hooks/useDatabase.ts`（订阅 persona 数据）

**Acceptance Criteria**
- 默认进入页面时，负荷模型=画像曲线，并有一个默认 persona 被选中
- 切换到 ABCD 模式时，原字段可编辑且能正常分析

**QA Scenario（Playwright）**
```
Scenario: Switch load model and run analysis
  Tool: Playwright
  Preconditions: Dev server running, tariffs exist for a province
  Steps:
    1. Navigate to /self-consumption
    2. Upload load file
    3. Ensure load model = persona
    4. Select persona "办公楼/园区办公"
    5. Run analysis; wait for results container
    6. Switch load model = ABCD
    7. Run analysis again
    8. Screenshot: .sisyphus/evidence/task-6-model-switch.png
  Expected Result: Both modes complete analysis without errors
```

---

### 7) SelfConsumption：支持“月总电量(kWh)”简化导入（并兼容旧 TOU 月电量）

**What to do**
- 扩展导入流程以识别新格式：
  - Excel/CSV 包含 `月份/月/Month` + `总电量/用电量/consumption/kWh`（字段名可做宽松匹配）
- 实现策略（建议）：
  - 优先复用 `utils/excelParser.ts`，新增第三种格式识别（monthly-total）并返回新类型（例如 `MonthlyTotalConsumption[]`）
  - SelfConsumption state 同时支持两种输入：`MonthlyConsumption[]`（旧）与 `MonthlyTotalConsumption[]`（新）
  - Aligned engine persona 模式使用“月总电量”；若用户导入旧格式，则自动用 sum(tip..deep) 得到月总电量
- UI：在上传区显示识别到的格式类型，并在旧格式下提示“画像模式将按月总电量分配，忽略 TOU 分解字段（仅用于总量求和）”

**References**
- `utils/excelParser.ts:106-139`（格式检测）
- `utils/excelParser.ts:250-280`（主 parseConsumptionFile）
- `services/consumptionAlignedService.ts:248-258`（sumMonthlyEnergyKwh）
- `services/loadDataService.ts`（可参考其月总解析思路，但注意该文件标注 deprecated）

**Acceptance Criteria**
- 上传新格式文件后，SelfConsumption 能完成分析
- 旧格式文件仍可解析并完成分析

**QA Scenario（Playwright）**
```
Scenario: Import monthly-total file and analyze
  Tool: Playwright
  Steps:
    1. Navigate to /self-consumption
    2. Upload monthly-total load file (12 rows)
    3. Select persona mode (default)
    4. Run analysis
    5. Assert results show non-zero totalEstimatedLoad
    6. Screenshot: .sisyphus/evidence/task-7-monthly-total-import.png
```

---

### 8) tests-after：补齐关键单测与组件测试

**What to test**
- Resolver：weekday/weekend grids 解析正确；无 weekend_time_rules 时 fallback 正确
- Aligned engine：persona 模式守恒（月总一致）；节假日按周末曲线；weekday/weekend TOU 生效
- Excel parser：新 monthly-total 格式识别与解析
- UI（可选少量 RTL）：SelfConsumption 模式切换，persona 选择器渲染

**References**
- `services/consumptionAlignedService.test.ts`（已存在，扩展）
- `components/SelfConsumption/index.test.tsx`（RTL 测试模式参考）
- `vitest.config.ts` / `setupTests.ts`（测试环境）

**Acceptance Criteria**
- `npm test` → PASS
- `npm run build` → PASS

---

### 9) 备份/恢复：把 persona 纳入全量备份（Admin/Settings）

**Why**
Persona 是用户自定义核心数据；必须跟随现有备份/恢复链路。

**What to do**
- Admin 全量备份/恢复：`components/admin/BackupRestore.tsx`
  - backup.data 增加 `personas`
  - restoreFromFile 识别并调用 `onRestorePersonas`
- Admin 模块数据流：`components/admin/AdminModule.tsx`（或对应数据聚合处）
  - 增加 personas 的订阅与传参
- Settings 简易导出（如仍在用）：`components/Settings.tsx`
  - export/import JSON 增加 personas（或明确提示用户改用 Admin 全量备份）

**References**
- `components/admin/BackupRestore.tsx:45-56`（当前全量备份结构）
- `components/admin/BackupRestore.tsx:102-124`（当前全量恢复解析）
- `components/Settings.tsx:26-66`（当前简易导出/导入）
- `hooks/useDatabase.ts`（新增 `usePersonas` 后，用于管理中心订阅）

**Acceptance Criteria**
- 备份文件中包含 personas 数组
- 恢复后 personas 数据可在 persona 库 UI 中看到（数量一致）

---

## Commit Strategy（建议）
- Commit 1：`feat(time-config): add weekend rules schema`（types + db schema + migration）
- Commit 2：`feat(time-config): edit weekday/weekend in matrix`（UI + utils）
- Commit 3：`feat(persona): add load persona library`（schema + seed + hooks + basic UI）
- Commit 4：`feat(self-consumption): persona load mode + monthly-total import`（engine + UI + parser）
- Commit 5：`test: cover resolver/persona/import`（tests-after）

---

## Success Criteria

### Verification Commands
```bash
npm test
npm run build
```

### Final Checklist
- [ ] TimeConfig 可保存 weekday/weekend 两套规则（节假日按周末）
- [ ] Persona 库存在、可 CRUD、可持久化
- [ ] SelfConsumption 默认使用 persona 模式，可切回 ABCD
- [ ] SelfConsumption 支持旧 TOU 月电量导入 + 新月总电量导入
- [ ] weekday/weekend TOU 仅影响 SelfConsumption（首版范围）
- [ ] tests/build 全绿
