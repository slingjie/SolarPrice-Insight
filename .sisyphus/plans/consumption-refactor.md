# PVGIS+TOU+三级负荷 消纳计算对标重构计划

## TL;DR

> **Quick Summary**: 将当前项目中分散的“消纳分析/自发自用”实现统一为一个模块，并按参考仓库 `.tmp/PV-consumption-analysis-model/services/calculationService.ts` 的三级负荷模型 (A/B/C) 与公式进行对标。
>
> **Deliverables**:
> - 新的“对标版”消纳计算引擎（三级负荷 + TOU + PVGIS/PV Excel）
> - 统一后的 UI 入口（替换现有 `SelfConsumption` 与 `ConsumptionModule` 两套）
> - 输入数据：用电分TOU两种格式都支持；发电量支持 PVGIS API + 24x12 Excel
> - 输出：8760小时能量流、自发自用/上网/购电、TOU分段电量与金额
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: 时间对齐/TOU月配置 → 三级负荷引擎(TDD) → UI合并与财务输出

---

## Context

### Original Request
需要详细对比当前程序与 GitHub 仓库 `PV-consumption-analysis-model` 的“消纳计算 + 用户负荷拆分”计算，并在当前程序中完成：
1) 对标参考仓库的计算内容；2) 连贯的用户负荷拆分；3) 结合本程序省份 TOU 时段配置；4) 同步输入目标位置进行发电量计算；5) 三者合并得到最终消纳结果；6) 展示 TOU 分段电价收益。

### Decisions (Confirmed)
- **负荷拆分模型**: 三级负荷模型 A/B/C（对标参考仓库）
- **用电数据输入**: 分TOU用电量；两种格式都支持（month-row 与 tou-row）
- **TOU配置来源**: 使用本项目的省份 TOU 配置库（TimeConfig），并按 month_pattern 做月度选择
- **省份选择方式**: 从 PVGIS 输入的经纬度自动推断（本地边界数据）
- **发电量数据来源**: PVGIS API + Excel 上传（24行×12列，参考仓库格式）
- **结果展示**: 需要 TOU 分段分析与电价收益（结合电价数据库 tariffs）
- **测试策略**: TDD（Vitest）
- **旧逻辑**: `services/loadDataService.ts:generateHourlyLoadFromMonthly()` 标记弃用，统一模块不再调用

### Locked Semantics (为避免实现时关键假设)

**Time Axis (8760) 与时间键规范**
- **Simulation base year**: 固定使用非闰年 `2021`（保证严格 8760）。
- **Time zone**: 业务时间统一按中国本地时区 `UTC+8`。
- **Internal join key (唯一对齐口径)**: `TimeKey = "MM-DD HH:00"`（与 `services/consumptionCalcService.ts` 一致）。
- **Display timestamp (用于图表/Date 解析，避免 locale 依赖)**: `IsoLocal = "YYYY-MM-DDTHH:00:00+08:00"`（固定 2021 年）。
- **Leap year handling**: 本次对标不引入 8784；所有计算强制 8760（Feb 29 不存在）。

**Units (单位口径写死)**
- `load`, `pv`, `self`, `gridExport`, `gridImport` 统一使用 **kWh（每小时能量）**。
- PVGIS 输入 `HourlyData.pvPower` 为 **W（小时平均功率）**：按当前项目既有口径，转换为每小时能量 `pvKwh = pvPower / 1000`。
- PV Excel 24x12 输入为 **Wh/kWp**：转换为每小时能量 `pvKwh = (WhPerKwp/1000) * pvCapacityKwp`。

**PVGIS → TimeKey 归并规则（分钟/年份差异的确定性处理）**
- PVGIS `h.time`（如 `2005-01-01T00:10:00Z`）先做 UTC→China(+8) 转换，再 **按小时 floor** 归并到 `TimeKey`。
- 若同一 `TimeKey` 出现多条 PVGIS 记录（例如分钟粒度导致的重复），则 **累加** `pvKwh`。

**PVGIS → 8760 对齐的边界裁决（必须写死，避免 KPI 漂移）**
- 统一模块先生成 baseYear=2021 的 canonical 8760 `TimeKey` 列表。
- PVGIS 归并后的 `TimeKey` 若不在 canonical 列表内：直接丢弃（包括 `02-29`）。
- canonical 列表中若某个 `TimeKey` 在 PVGIS 中缺失：该小时 `pvKwh=0`（补零）。
- 若出现“丢弃或补零”：UI 必须显示 warning（例如“PV 数据存在缺失/超界小时，已按规则补零/丢弃”）。

**Work Pattern（智能计算）的明确语义**
- `双休`：周六+周日为休息日。
- `单休`：仅周日为休息日（周六为工作日）。
- `无休`：全年每天为工作日。
- 工作日的 Level 判定：
  - A：`workStartHour <= hour < workEndHour`
  - B：其他小时
  - C：休息日全天

**Weekday 判定口径（写死并测试，且不依赖运行环境 TZ）**
- 不使用 `Date(string).getDay()`（会受运行环境时区影响）。
- 采用确定性算法：`weekday = new Date(Date.UTC(baseYear, month-1, day)).getUTCDay()`。
  - 这表示“该日历日期的星期几”，与运行环境时区无关。
- 回归样例（需写测试，baseYear=2021）：
  - `2021-01-02` 为周六（6）
  - `2021-01-03` 为周日（0）

**省份名称规范化（写死并测试，避免 TimeConfig/tariffs 失配）**
- `provinceLookupService` 输出取 `china.json.features[].properties.name`（如“北京市”“江苏省”“内蒙古自治区”）。
- 统一模块在匹配 `TimeConfig.province` 与 `TariffData.province` 前做规范化：
  - 去除后缀：`省`, `市`, `自治区`, `特别行政区`, `壮族自治区`, `回族自治区`, `维吾尔自治区`
  - 例：`北京市`→`北京`，`内蒙古自治区`→`内蒙古`，`广西壮族自治区`→`广西`
- 匹配策略：优先“规范化后全等”，其次允许 `includes`（用于兼容库里混写全称/简称）。

**省份推断的几何细节与失败回退（写死并测试）**
- GeoJSON polygon 坐标顺序为 `[lon, lat]`；输入点必须使用 `[lon, lat]` 进行 point-in-polygon。
- 若点不落在任何省 polygon 内：
  - `inferProvince(lat, lon)` 返回 `null`
  - UI 提示用户手动选择省份；如用户仍要继续电量计算，则 TimeConfig 回退到 `province='全部'`
  - 若 province 未确定：财务计算置灰/提示（避免错误使用 tariffs）

**Tariff 选择与月份匹配（写死并测试）**

**Tariff 选择输出契约（避免 UI/引擎口径分歧）**
- UI 不选择“单条 tariff”，而是选择一个 tariff 维度组合：`province + category + voltage_level`（可选 city）。
- UI 将 DB 中满足该组合的 **整组** `TariffData[]` 传入引擎（按月序列，可能包含多个年份）。

**引擎内部按 month(1..12) 选择 tariff**:
1) 在已选 tariffs 中筛选 `tariff.month` 以 `-MM` 结尾的所有条目
2) 若多条（不同年份），取 **年份最新**（按数值 year 最大；不是字典序）
3) 若该月不存在，回退到 **已选 tariffs 中最新的一条**（任何月份）

**TariffData.month 规范化（避免格式差异导致匹配失效）**
- 引擎内部对 `tariff.month` 做 normalize：
  - `trim()`
  - 若匹配 `^\d{4}-\d{1,2}$`：将月补零为两位（例如 `2025-1` → `2025-01`）
  - 其他格式：视为不可解析；只参与回退（不参与按月筛选）

**TOU → Price 绑定规则（写死并测试）**
- 逐小时 `touType` **只**来自本次计算使用的 `TimeConfig` 网格（因为负荷拆分按 TOU 口径对标）。
- 金额计算逐小时价格采用：`price = selectedTariff.prices[touType]`。
- `PriceSchema.deep` 可选字段的确定性处理：当 `touType === 'deep'` 且 `selectedTariff.prices.deep` 缺失时，按 `price = selectedTariff.prices.valley ?? 0` 回退，并在 UI 给出提示。
- `TariffData.time_rules` 在本模块中仅用于一致性校验（可选）：
  - 若 `rulesToGrid(tariff.time_rules)` 与 `rulesToGrid(timeConfigForMonth.time_rules)` 不一致，给出 UI 警告；但仍以 `TimeConfig` 的 `touType` 为准。

**金额口径（写死并测试）**
- `baselineGridCost = Σ(loadKwh * price)`
- `importCost = Σ(gridImportKwh * price)`
- `exportRevenue = Σ(gridExportKwh * feedInTariff)`
- `withPvNetCost = importCost - exportRevenue`
- `savingsVsNoPv = baselineGridCost - withPvNetCost`（等价于 `Σ(selfKwh*price) + exportRevenue`）
- 货币单位优先取 `TariffData.currency_unit`；若跨月不一致，UI 显示“多币种/混合”。

**TOU label 映射（避免尖/峰/平/谷/深与 tip/peak/... 混淆）**
- 支持别名：
  - tip: `tip`, `尖`, `尖峰`, `尖时`
  - peak: `peak`, `峰`, `高峰`
  - flat: `flat`, `平`, `平段`
  - valley: `valley`, `谷`, `低谷`
  - deep: `deep`, `深`, `深谷`
- deep 字段缺省：缺失时视为 0（与 `utils/excelParser.ts` 现状保持一致）。

### Current Implementation Inventory (SolarPrice-Insight)

当前项目存在多套“消纳/自用”实现，且存在关键对齐问题：

1) PVGIS → ConsumptionModule 路线
- UI: `components/consumption/ConsumptionModule.tsx`
- 负荷：`services/loadDataService.ts`（月总量 → 8760）
- 消纳：`services/consumptionCalcService.ts`（将 PVGIS UTC → China +8，并用 `MM-DD HH:00` key 匹配）
- 优点：时间匹配较稳健（忽略年份/分钟），但不支持 TOU 分解与 A/B/C 模型

2) SelfConsumption (TOU) 路线
- UI: `components/SelfConsumption/index.tsx`
- 负荷：`utils/excelParser.ts:parseConsumptionFile()` → `types/analysis.ts:MonthlyConsumption[]`
- 负荷合成：`utils/loadSynthesizer.ts:synthesizeLoadCurve()`（按TOU类型均分到小时）
- 消纳：`utils/loadSynthesizer.ts:calculateBalance()`（用 time 字符串等值匹配 PV）
- 关键问题：PVGIS 的时间为 `2005-..T..:10:00Z`（UTC、分钟=10、年份=2005）
  而 loadSynthesizer 生成 `YYYY-..T..:00:00`（无 Z、年份=当前年、分钟=00）。
  结果：PV 与负荷无法按字符串 key 对齐，导致消纳计算不可信。
- 另一个问题：未按 `TimeConfig.month_pattern` 为不同月份选择不同 time_rules。

3) Legacy 简化版本
- `components/SelfConsumptionAnalysis.tsx` + `services/solarCalculator.ts`
- 仅典型日 24 小时，不符合本次“对标 8760+TOU+PVGIS”目标。

### Reference Implementation (PV-consumption-analysis-model)

核心对标文件：`.tmp/PV-consumption-analysis-model/services/calculationService.ts`
- **三级分类**（A/B/C）：
  - A：工作日工作时段
  - B：工作日非工作时段
  - C：休息日全天
- **关键公式**：
  - `P_work_A = totalEnergy / (N_A + R_B*N_B + R_C*N_C)`
  - `P_work_B = P_work_A * R_B`
  - `P_work_C = P_work_A * R_C`
- **逐时消纳**：
  - `self = min(load, pv)`
  - `export = max(0, pv-load)`
  - `import = max(0, load-pv)`
- PV 输入：24x12（小时行，月份列）
- 用电输入：tou-row（尖/峰/平/谷/深 行，月份列）
- TOU 时段：month-row（月份行，0-1..23-24 列）

### Reference Repo Availability（对标依赖可复现性）

对标测试将直接 import / 运行参考仓库的 `calculateConsumptionLogic()`。

**约定**：参考仓库位于本项目根目录 `.tmp/PV-consumption-analysis-model/`。

**Reference**:
- repo: `https://github.com/slingjie/PV-consumption-analysis-model.git`
- expected branch: `main`
- pinned commit (current local): `114c014f9e82c6bdc7f346bea1324cb69ed7173e`

**获取方式（本地执行前一次性完成）**：
```bash
mkdir -p .tmp
git clone https://github.com/slingjie/PV-consumption-analysis-model.git .tmp/PV-consumption-analysis-model
```

**存在性检查（对标测试应先 assert）**：
- `.tmp/PV-consumption-analysis-model/services/calculationService.ts` 存在
- 存在导出的 `calculateConsumptionLogic`

注：本计划中 `types.ts` / `services/*` / `components/*` 默认指 **SolarPrice-Insight 根目录**；以 `.tmp/PV-consumption-analysis-model/...` 前缀的路径指 **对标参考仓库**。

---

## Work Objectives

### Core Objective
在 SolarPrice-Insight 内实现“三级负荷(A/B/C) + 省份TOU + PVGIS/PV Excel + 电价收益”的统一消纳模块，并保证计算结果与参考仓库核心公式一致（对标）。

### Concrete Deliverables
- 新的计算引擎（建议新文件，避免破坏旧逻辑）：
  - `services/consumptionAlignedService.ts`（或同等命名）
- 新的输入解析/适配：
  - 扩展 `utils/excelParser.ts` 支持 tou-row 格式
  - 新增 `utils/pvExcelParser.ts` 支持 PV 24x12 格式
- 新的 TOU 月度规则解析：
  - `utils/timeConfigResolver.ts`（按 month_pattern 给每个月选择 time_rules）
- 新的省份推断：
  - `services/provinceLookupService.ts`（使用 `public/maps/china.json` FeatureCollection）
- UI 合并（单入口）：
  - 将 `components/SelfConsumption/index.tsx` 与 `components/consumption/ConsumptionModule.tsx` 合并为一个体验一致、可从 PVGIS 与“自消费”入口进入的模块
  - `App.tsx` 的 `view === 'self-consumption'` 路径不再使用 `components/SelfConsumptionAnalysis.tsx`
- 输出增强：
  - TOU 分段电量（自用/上网/购电）
  - 金额（节省/购电成本/上网收益）

### Must NOT Have (Guardrails)
- 不修改 RxDB schema（`services/db.ts`）
- 不做“阶梯电价/容量电价”等新业务
- 不引入网络依赖来推断省份（省份推断必须本地完成）
- 不用 `Date.parse()` 作为 PV/负荷的唯一对齐方式（必须使用稳定的 hour-key 对齐）

---

## Verification Strategy (TDD / Vitest)

### Test Decision
- **Infrastructure exists**: YES (`vitest.config.ts`, `npm run test`)
- **User wants tests**: TDD

### Global Verification Commands
```bash
npm run test
npm run build
```

### Golden Rules for Tests
- 引擎输出必须满足逐小时守恒：
  - `self + export == pv`（允许浮点误差）
  - `self + import == load`
- 月度汇总必须等于逐小时汇总
- 解析器需覆盖中英文/简写月份与 TOU 字段名

### 对标验证（必须做，避免“感觉一致”）

对标基准：`.tmp/PV-consumption-analysis-model/services/calculationService.ts:calculateConsumptionLogic()`

对标方式（写成可执行测试）：
- 在 Vitest 中准备一组固定输入夹具（不依赖 PVGIS 在线请求）：
  - PV：24x12（Wh/kWp）
  - TOU：month-row（Month + 0-1..23-24）
  - 用电：tou-row（tou + Jan..Dec）
  - config：pvCapacity、workStartHour/workEndHour、workRestRatio/restDayRatio、monthlyDays（可用 2021 日历推导得到的 workdays/restdays）
- 运行参考仓库的 `calculateConsumptionLogic` 得到 `kpis` 与 `monthlyAggregates`
- 运行本项目新引擎得到同口径输出
- 断言以下字段在容差内一致（toBeCloseTo）：
  - 年度：totalPVGeneration / totalEstimatedLoad / totalSelfConsumption / totalGridExport / totalGridImport
  - 月度：每月 pvGeneration / estimatedLoad / selfConsumption / gridExport / gridImport

注：对标测试允许只覆盖 1-2 个代表月（例如 Jan/Jul）以降低 fixture 规模，但必须有客观对比。

---

## Execution Strategy

Wave 1 (Foundations - start immediately)
├── Task 1: 时间对齐 TimeKey + IsoLocal（修复 PVGIS/负荷错配）
├── Task 2: 用电 Excel 解析器支持两种格式（month-row + tou-row）
├── Task 3: PV Excel 24x12 解析与 hour-key 展开
└── Task 4: TimeConfig 月度选择器（month_pattern） + 回退策略

Wave 2 (Core engine)
├── Task 5: 三级负荷(A/B/C)+TOU 对标引擎（P_work_A/B/C 公式）
└── Task 6: 财务计算（tariffs + feed-in tariff）+ TOU 分段汇总

Wave 3 (UI merge + wiring)
├── Task 7: 省份推断（china.json）+ 省份名称规范化（匹配 TimeConfig/tariffs）
├── Task 8: UI 合并与入口梳理（PVGIS 入口 + 自消费入口）
└── Task 9: 弃用旧路径/旧组件（保持向后兼容）

---

## TODOs

### 1) 统一小时对齐 TimeKey（修复 PVGIS vs 负荷时间错配）

**What to do**:
- 新增 `utils/timeKey.ts`（或同等）提供：
  - `toChinaHourKeyFromIsoUtc(isoUtc: string): string` → `MM-DD HH:00`
  - `toIsoLocalFromMonthDayHour(baseYear: number, month: number, day: number, hour: number): string` → `YYYY-MM-DDTHH:00:00+08:00`
  - `toHourKeyFromMonthDayHour(month, day, hour): string`
  - `hourKeyToMonthDayHour(key)`（测试与聚合用）
**迁移说明（避免重复返工）**:
- Task 1 的 `TimeKey` 工具是后续“对标引擎/统一模块”的基础。
- 旧链路（`utils/loadSynthesizer.ts:calculateBalance()` 的字符串等值匹配）不做深度修复；统一模块完成后将由新引擎替代。
- 若需要过渡验证，可在 `components/SelfConsumption/index.tsx` 暂时增加“按 TimeKey 对齐”的适配层，但应尽量薄（避免在旧逻辑上二次重构）。

**Compatibility note**:
- 为保证跨机器/CI 的确定性，统一模块的聚合统计与图表数据生成应基于 `TimeKey` 解析（而不是 `new Date(time)`）。
- `IsoLocal` 仅用于 UI 展示（tooltip/导出），不参与核心统计口径。

**References**:
- `services/consumptionCalcService.ts`（现有的 `convertUtcToChina()` 与 `generateTimeKey()` 思路）
- `services/pvgisService.ts:fetchHourlyData()`（PVGIS 产出的 `time` 带分钟和年份）
- `components/SelfConsumption/index.tsx`（当前 `pvCurve` 直接用 `h.time`，导致对齐失败）

**Acceptance Criteria**:
- [x] 新增 `utils/timeKey.test.ts` 覆盖：UTC→China +8 跨日、分钟归并到小时
- [x] 新增（或替换）图表聚合函数的单测：基于 `TimeKey` 统计月度与典型日，不依赖运行环境 TZ
- [x] `npm run test` → PASS

### 2) 用电 Excel 输入支持两种格式（month-row + tou-row）

**What to do**:
- 扩展 `utils/excelParser.ts:parseConsumptionFile()`：
  - 继续支持现有格式：列包含“月份/尖峰/高峰/平段/低谷/深谷”
  - 新增支持参考仓库格式：第一列 `tou`（尖/峰/平/谷/深），后续列为月份（Jan..Dec 或 1月..12月）
  - 输出统一为 `types/analysis.ts:MonthlyConsumption[]`（month=1..12，每月 tip/peak/flat/valley/deep）

**References**:
- `utils/excelParser.ts`（现有 month-row 解析）
- `.tmp/PV-consumption-analysis-model/services/calculationService.ts:csvToJSON()` 与 `validateConsumptionData()`（参考仓库 tou-row 预期）

**Acceptance Criteria**:
- [x] `utils/excelParser.test.ts`：同一数据用两种格式导入，输出 MonthlyConsumption[] 的每月总量相等
- [x] `npm run test` → PASS

### 3) PV 24x12 Excel 解析（参考仓库格式）

**What to do**:
- 新增 `utils/pvExcelParser.ts`：
  - 支持第一列为 `0 - 1`…`23 - 24`（或 `0-1`）
  - 列为月份（Jan..Dec / 1月..12月）
  - 单位约定：输入为 `Wh/kWp`（与参考仓库一致），引擎中按 `pvCapacity(kWp)` 转为 `kWh`：`pvKwh = (Wh/kWp / 1000) * pvCapacity`
- 提供导出为 hour-key map 的方法：按每月天数重复 24 小时 profile（与参考仓库一致）

**References**:
- `.tmp/PV-consumption-analysis-model/services/calculationService.ts`：`pvGeneration = (pvGeneration1kWp_Wh/1000)*pvCapacity`

**Acceptance Criteria**:
- [x] `utils/pvExcelParser.test.ts` 覆盖：月份识别、24行校验、数值解析
- [x] `npm run test` → PASS

### 4) TimeConfig month_pattern 月度解析 + 24小时网格生成

**What to do**:
- 新增 `utils/timeConfigResolver.ts`：
  - 输入：`TimeConfig[]`, provinceName, month(1..12)
  - 选择规则：
    1) province 精确匹配 + month_pattern 命中该月
    2) province 精确匹配 + month_pattern == 'All'
    3) province == '全部' + month_pattern 命中
    4) province == '全部' + month_pattern == 'All'
  - 冲突/重叠的确定性规则（写死并测试）：
    - 若同一优先级下有多条候选，选 `last_modified` 最新的；若仍相同，按 `id` 字典序最小者（保证稳定）。
- month_pattern 解析规则（写死）：
  - `All`（忽略大小写）表示全年（兼容未来可能出现的 all/ALL；现有 UI 通常写入 'All'）
  - 否则按 `,` 分割，`trim()` 后 `parseInt`，仅保留 1..12
  - token 非法（NaN/越界）直接忽略
- 输出：当月 `TimeRule[]` 与 `rulesToGrid()` 生成的 `TimeType[24]`

**References**:
- `types.ts:TimeConfig`（month_pattern 与 time_rules）
- `utils/timeUtils.ts:rulesToGrid()`
- `constants.tsx:DEFAULT_TIME_CONFIGS`（含 month_pattern 示例与 24:00 规则）
- `components/TimeConfigMatrix.tsx`（现有 month_pattern 组装/解析的 UI 约定可参考）

**Acceptance Criteria**:
- [x] `utils/timeConfigResolver.test.ts` 覆盖 month_pattern 优先级与回退
- [x] `npm run test` → PASS

### 5) 三级负荷(A/B/C) + TOU 分摊引擎（对标参考仓库公式）

**What to do**:
- 新增引擎文件 `services/consumptionAlignedService.ts`（建议纯函数，便于TDD）：
  - 输入：
    - `MonthlyConsumption[]`（每月 tip/peak/flat/valley/deep）
    - `pvSource`（PVGIS hourly 或 PV 24x12）
    - `timeConfigs`（用于每月解析 TOU grid）
    - `workSchedule`：workStartHour/workEndHour + workPattern(单休/双休/无休) + R_B/R_C
  - 输出：
    - 8760 小时级结果（固定 baseYear=2021）：
      - `timeKey: MM-DD HH:00`
      - `timeIsoLocal: YYYY-MM-DDTHH:00:00+08:00`
      - `touType` + `level(A/B/C)` + dayType
      - load/pv/self/export/import（单位 kWh）
    - 月度汇总 + 年度 KPI
    - TOU 分段汇总（电量）

**Implementation Notes (对标关键点)**:
对每个月（严格对标参考仓库：每月只解一组 P_work_A/B/C，不按 TOU 单独解）:
1) 生成该月所有小时画像：
   - `touType` 来自当月 TimeConfig 网格
   - `level` 来自 workPattern + workStartHour/workEndHour
2) 统计该月 level 小时数：`N_A/N_B/N_C`（跨所有 touType 累计）
3) 计算该月总电量：`totalEnergy = tip + peak + flat + valley + deep`（kWh）
4) 计算 `totalWeightedHours = N_A + R_B*N_B + R_C*N_C`
5) 解方程：
   - `P_work_A = totalEnergy / totalWeightedHours`
   - `P_work_B = P_work_A * R_B`
   - `P_work_C = P_work_A * R_C`
6) 对该月每个小时：仅由 `level` 决定 `loadKwh`（A→P_work_A, B→P_work_B, C→P_work_C）

TOU 在引擎中的作用（明确口径，避免歧义）:
- `MonthlyConsumption` 的 tip/peak/flat/valley/deep 仅用于求 `totalEnergy` 与数据一致性检查。
- 输出的 TOU 分段电量/金额来自“逐小时 loadKwh 按 touType 聚合”，不强约束与输入的 TOU 分项电量一致（参考仓库同样如此）。

数据一致性检查（对标参考仓库 validateDataConsistency 的意图）:
- 若某月 TimeConfig 中某个 touType 的小时数为 0，但输入该 touType 用电量 > 0：输出 warning
- 若某月 TimeConfig 中定义了某 touType（小时数>0），但输入该 touType 用电量为 0 或无效：输出 warning

**对标语义声明（必须写进实现与测试）**
- 为严格对标参考仓库：
  - 仅保证“月总电量守恒”（`sum(tip..deep)`），用于解 `P_work_A/B/C` 并分配逐小时负荷。
  - 不强约束“各 TOU 分项电量在输出中严格等于输入”（输出的 TOU 分段电量来自 hour-level `touType` 归属与 A/B/C 分配结果）。
  - 可选：输出中提供对比表（输入各 TOU kWh vs 输出各 TOU kWh），用于用户理解差异。

**References**:
- `.tmp/PV-consumption-analysis-model/services/calculationService.ts:calculateConsumptionLogic()`（统计 hourCounts + 解 P_work_A + 逐小时 load）
- `types/analysis.ts:MonthlyConsumption`（现有分TOU结构）

**Acceptance Criteria**:
- [x] `services/consumptionAlignedService.test.ts`：包含“解方程 golden fixture”（写死期望值）
  - counts:
    - tip: A=2,B=0,C=0
    - peak: A=0,B=2,C=0
    - flat: A=0,B=0,C=2
  - consumption: tip=200, peak=100, flat=60
  - R_B=0.5, R_C=0.25
  - 期望：`P_work_A = 360/3.5 ≈ 102.8571429`，`P_work_B ≈ 51.4285714`，`P_work_C ≈ 25.7142857`（toBeCloseTo）
- [x] 同时验证逐小时守恒：`self+export==pv`, `self+import==load`（允许浮点误差）
- [x] `workPattern` 的 weekday 判定有测试覆盖（baseYear=2021, +08:00）：
  - 双休：2021-01-02(周六) 与 2021-01-03(周日) 为休息日
  - 单休：仅 2021-01-03 为休息日
- [x] 固定 baseYear=2021 时结果长度为 8760
- [x] `npm run test` → PASS

### 6) 财务计算：结合 tariffs（电价数据库）与 TOU 分段金额

**What to do**:
- 在引擎输出基础上增加 financial aggregation：
  - 购电成本：`gridImportKwh * price(touType)`
  - 自用节省：`selfConsumptionKwh * price(touType)`
  - 上网收益：`gridExportKwh * feedInTariff`（默认沿用 `services/solarCalculator.ts` 的 0.35，可在 UI 配置）
- UI 需要让用户选择 tariff（province 推断后，选择 category/voltage_level）。
- 引擎按“Locked Semantics”中定义的 tariff 月份匹配与回退规则执行。

**References**:
- `types.ts:TariffData`（prices + time_rules）
- `services/solarCalculator.ts:calculateFinancialSavings()`（可复用其“按规则找价格/默认值”的思路，但要扩展到 8760 和 TOU 分段）
- `components/ComprehensivePriceCalculator.tsx`（本项目已有按 province/category/voltage/month 过滤 tariffs 的 UI 范式，可复用选择器逻辑）

**Acceptance Criteria**:
- [x] `services/consumptionFinancials.test.ts`（或同等）覆盖：金额计算正确、缺失月份 tariff 的降级策略清晰
- [x] 最小 golden fixture（写死期望值）：给定一组小时级输入（允许使用 2 天/48 小时子集的聚合函数），断言：
  - `baselineGridCost`, `importCost`, `exportRevenue`, `withPvNetCost`, `savingsVsNoPv` 与期望一致（toBeCloseTo）
- [x] `npm run test` → PASS

### 7) 省份推断：经纬度 → 省份（本地边界）

**What to do**:
- 新增 `services/provinceLookupService.ts`：
  - 加载 `public/maps/china.json`（FeatureCollection, features=35 已验证可 JSON.parse）
  - **实现方式写死：轻量自实现 point-in-polygon（不引入 turf 等新依赖）**，必须支持：
    - `Polygon` 与 `MultiPolygon`
    - ring 语义：第 1 个 ring 为外环；后续 ring 为洞（点落在洞内应视为“不在省内”）
  - 输出省份名称（如“北京市”“江苏省”）
- 新增 `utils/provinceNormalize.ts`（或同等）：实现“省份名称规范化”（见 Locked Semantics）并提供匹配 helper：
  - `normalizeProvinceName(name: string): string`
  - `provinceMatches(a: string, b: string): boolean`（先 normalized equality，再 includes 兜底）
- UI：经纬度输入后自动填充省份，允许手动覆盖

**References**:
- `public/maps/china.json`（已存在 GeoJSON）
- `constants.tsx:PROVINCES`（当前列表不完整，未来可改为从 china.json 生成）

**Acceptance Criteria**:
- [x] `services/provinceLookupService.test.ts`：写死坐标与期望（必须选明显在面内的点）：
  - 北京：lat=39.9042, lon=116.4074 → `北京市`
  - 上海：lat=31.2304, lon=121.4737 → `上海市`
  - 广州：lat=23.1291, lon=113.2644 → `广东省`
  - 明确覆盖 MultiPolygon（北京为 MultiPolygon）：测试需断言 MultiPolygon 分支被走到
- [x] `utils/provinceNormalize.test.ts`：断言 `normalizeProvinceName('江苏省') === '江苏'`、`normalizeProvinceName('内蒙古自治区') === '内蒙古'`
- [x] `utils/timeConfigResolver.test.ts` 增加用例：TimeConfig.province='江苏省' 时，province='江苏' 仍可匹配
- [x] `npm run test` → PASS

### 8) UI 合并与入口梳理

**What to do**:
- 以 `components/SelfConsumption/index.tsx` 为主线（已有 TOU 上传与 PVGIS 参数 UI），补齐：
  - 三级负荷配置（workPattern、workStart/End、R_B/R_C）
  - PV 数据源选择（PVGIS / Excel 24x12）
  - 省份自动推断与 TOU 配置提示
  - 结果：增加 TOU 分段电量与金额展示
- 将 `components/consumption/ConsumptionModule.tsx` 的入口整合：
  - `components/pvgis/PVGISModule.tsx` 的“消纳分析”Tab 指向统一模块
- `App.tsx` 的 `view === 'self-consumption'` 不再渲染 `components/SelfConsumptionAnalysis.tsx`

**Wiring specifics (避免集成阶段猜测)**:
- 统一模块落点：以 `components/SelfConsumption/index.tsx` 作为“唯一模块”持续演进（不新建平行入口）。
- `App.tsx` 已持有 `tariffs` 与 `timeConfigs` 状态；改造 `components/SelfConsumption/index.tsx` props 至少包含：
  - `timeConfigs: TimeConfig[]`
  - `tariffs: TariffData[]`
  - `initialPvHourlyData?: HourlyData[]`（可选，用于 PVGIS 入口复用）
  - `initialPvParams?: PVGISParams`（可选；至少包含 lat/lon/peakPower/loss/azimuth/angle，用于省份推断与“复算”能力）
  - `initialLatLon?: { lat: number; lon: number }`（可选；当 PVGIS 入口只传位置不传 pvHourlyData 时使用）
  - `onBack?: () => void`
- `App.tsx` 的 `view === 'self-consumption'` 渲染该统一模块，并把 `tariffs/timeConfigs` 透传。
- `components/pvgis/PVGISModule.tsx` 目前未接收 `tariffs/timeConfigs`，需要新增 props 并从 `App.tsx` 透传，再把它们传给“消纳分析”Tab 的统一模块。
- PV 数据源：
  - 从 PVGIS 入口进入：允许复用 PVGIS 已计算的 `pvHourlyData`（若存在），否则统一模块自己调用 `pvgisService.getPVData()`。
  - 从自消费入口进入：默认自己调用 PVGIS；用户可切换为 PV Excel 24x12。

**Priority rules (写死，避免集成时猜测)**:
- 省份推断优先使用：`initialPvParams.lat/lon` → `initialLatLon` → 用户手动输入 lat/lon。
- 若存在 `initialPvHourlyData` 但缺少 lat/lon：不做自动推断（提示用户补充经纬度或手动选择省份）。

**References**:
- `components/SelfConsumption/index.tsx`
- `components/consumption/ConsumptionModule.tsx`
- `components/pvgis/PVGISModule.tsx`
- `App.tsx`（self-consumption view）

**Acceptance Criteria**:
- [x] `npm run build` → PASS
- [x] `npm run test` → PASS
- [x] PVGIS 入口与自消费入口都能跑通，并满足：
  - 年 KPI（总发电/总用电/总自用）非零 ✅ 用户确认已有计算结果，发电量非零
  - KPI 与月度汇总之和一致（允许浮点误差） ✅ 引擎逻辑保证守恒
  - 省份推断成功时：省份字段自动填充，且能找到对应 `TimeConfig` ✅ 已实现 provinceMatches 匹配

### 9) 弃用旧函数/旧实现（保持向后兼容）

**What to do**:
- `services/loadDataService.ts:generateHourlyLoadFromMonthly()` 增加 `/** @deprecated */` 与 console warn（只在开发环境）
- 统一模块不再调用该函数
- `components/SelfConsumptionAnalysis.tsx` 从主入口移除（保留文件不删，避免历史依赖）

**Acceptance Criteria**:
- [x] `npm run build` → PASS

---

## Commit Strategy

- 建议按“基础能力 → 引擎 → UI”拆分成多个原子提交（由执行代理决定）。
