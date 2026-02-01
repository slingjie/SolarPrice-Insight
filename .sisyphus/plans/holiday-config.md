# 法定节假日配置功能

## TL;DR

> **Quick Summary**: 在消纳计算程序中增加法定节假日配置功能，支持全局节假日库管理和项目级多选，新增 Level D 负荷等级用于节假日计算。
> 
> **Deliverables**:
> - RxDB `holidays` 集合及数据层服务
> - 扩展 WorkSchedule 类型支持 R_D 和 selectedHolidayIds
> - 节假日管理 UI（Modal 编辑器 + 多选复选框）
> - 修改消纳计算核心逻辑支持 Level D
> - 预填充 7 个中国法定节假日
> - TDD 测试覆盖
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 4 → Task 6 → Task 8

---

## Context

### Original Request
在消纳计算程序中的工作作息配置中增加法定节假日的配置

### Interview Summary
**Key Discussions**:
- 数据来源：手动配置（用户在 UI 中添加/编辑，存储在本地 RxDB）
- 调休支持：不需要（只标记假日，不处理调休）
- 负荷等级：新增 Level D（节假日专用等级，可单独配置负荷比例 R_D）
- TOU 时段：节假日使用与工作日相同的 TOU 时段划分
- 作用范围：全局通用（所有省份共用一套节假日配置）
- 日期格式：MM-DD 格式（只存月-日，每年复用）
- 默认数据：预填充中国常见法定节假日
- UI 入口：消纳计算页面的 WorkSchedule 配置区域增加"编辑节假日库"按钮
- 存储方式：RxDB（创建 holidays 集合）
- 项目级多选：用户可勾选本次计算使用哪些节假日

**Research Findings**:
- 当前 getDayType 在 `services/consumptionAlignedService.ts`，基于 workPattern 和星期判断
- WorkSchedule 已有 R_B, R_C 字段
- RxDB schema 定义在 `services/db.ts`
- 项目有完善的 Vitest 测试基础设施（16个测试文件）

### Metis Review
**Identified Gaps** (addressed):
- 跨月节假日存储：使用范围 startDate/endDate + 代码展开
- Holiday vs Restday 优先级：holiday 优先（用 R_D）
- R_D 默认值：0.2（比 R_C 更低）
- 空选择行为：Level D 永不触发
- 02-29 闰日处理：忽略 + 警告

---

## Work Objectives

### Core Objective
在消纳计算程序中增加法定节假日配置功能，支持用户管理全局节假日库并在项目中选择性启用，通过新增 Level D 负荷等级实现节假日的独立计算。

### Concrete Deliverables
- `types.ts`: HolidayDefinition 接口、WorkSchedule 扩展
- `services/db.ts`: holidays 集合 schema
- `services/holidayService.ts`: 节假日 CRUD 服务
- `hooks/useDatabase.ts`: useHolidays hook
- `services/consumptionAlignedService.ts`: getDayType/getLevel/solveMonthlyBasePower 扩展
- `components/SelfConsumption/HolidayManager.tsx`: 节假日管理 Modal
- `components/SelfConsumption/index.tsx`: 集成节假日 UI
- `constants.tsx`: DEFAULT_HOLIDAYS 预填充数据

### Definition of Done
- [x] `npm run test` 全部通过
- [x] `npm run build` 无 TypeScript 错误
- [x] 节假日管理 UI 可正常增删改查
- [x] 消纳计算中 Level D 正确应用于选中的节假日

### Must Have
- 全局节假日库（RxDB 存储）
- 节假日 CRUD 管理 UI
- WorkSchedule 扩展（R_D + selectedHolidayIds）
- getDayType/getLevel 逻辑扩展
- 消纳计算中 Level D 的处理
- 预填充默认节假日数据
- TDD 测试覆盖核心逻辑

### Must NOT Have (Guardrails)
- 调休/补班日支持
- 按省份区分的节假日
- 外部 API 集成
- 多年份管理
- 节假日独立的 TOU 时段配置
- 复杂的日历选择器组件（使用简单 Modal + 列表输入）
- 过度抽象或提前优化

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES
- **User wants tests**: TDD
- **Framework**: Vitest

### TDD Workflow

Each TODO follows RED-GREEN-REFACTOR:

**Task Structure:**
1. **RED**: Write failing test first
   - Test command: `npx vitest [file] --run`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `npx vitest [file] --run`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `npx vitest [file] --run`
   - Expected: PASS (still)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: 类型定义与数据结构
└── Task 3: 默认节假日数据常量

Wave 2 (After Wave 1):
├── Task 2: RxDB schema 与服务层
├── Task 4: 消纳计算核心逻辑扩展
└── Task 5: useHolidays hook

Wave 3 (After Wave 2):
├── Task 6: 节假日管理 UI 组件
└── Task 7: SelfConsumption 页面集成

Wave 4 (After Wave 3):
└── Task 8: 端到端集成测试与验证

Critical Path: Task 1 → Task 2 → Task 4 → Task 6 → Task 8
Parallel Speedup: ~35% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 4, 5, 6 | 3 |
| 2 | 1 | 5, 6, 7 | 4 |
| 3 | None | 7 | 1 |
| 4 | 1 | 6, 7, 8 | 2, 5 |
| 5 | 1, 2 | 6, 7 | 4 |
| 6 | 2, 4, 5 | 7 | None |
| 7 | 2, 3, 4, 5, 6 | 8 | None |
| 8 | 7 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 3 | delegate_task(category="quick", load_skills=[], run_in_background=true) |
| 2 | 2, 4, 5 | dispatch parallel after Wave 1 completes |
| 3 | 6, 7 | delegate_task(category="visual-engineering", load_skills=["frontend-ui-ux"], run_in_background=false) |
| 4 | 8 | final integration verification |

---

## TODOs

- [x] 1. 类型定义与数据结构

  **What to do**:
  - 在 `types.ts` 中添加 `HolidayDefinition` 接口
  - 扩展 `WorkSchedule` 类型添加 `R_D: number` 和 `selectedHolidayIds: string[]`
  - 添加 `DayType` 类型别名：`'workday' | 'restday' | 'holiday'`
  - 添加 `LoadLevel` 类型别名：`'A' | 'B' | 'C' | 'D'`

  **Must NOT do**:
  - 不要添加省份关联字段
  - 不要添加年份字段

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件类型定义修改，范围明确
  - **Skills**: `[]`
    - 无需特殊技能
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: 不涉及 UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 3)
  - **Blocks**: Tasks 2, 4, 5, 6
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `types.ts:TimeConfig` - 现有接口定义模式（id, updated_at 等字段）
  - `types.ts:WorkSchedule` - 当前 WorkSchedule 定义位置

  **Type References**:
  - `types.ts:TimeType` - 现有类型别名定义模式

  **Test References**:
  - 类型定义无需单独测试，将在 Task 4 的功能测试中验证

  **WHY Each Reference Matters**:
  - `TimeConfig` 展示了项目中接口的标准字段（id, updated_at, last_modified）
  - `WorkSchedule` 是需要扩展的目标类型

  **Acceptance Criteria**:

  **Automated Verification**:
  ```bash
  # Agent runs:
  npx tsc --noEmit
  # Assert: Exit code 0, no type errors
  ```

  ```bash
  # Agent runs:
  grep -n "interface HolidayDefinition" types.ts
  # Assert: Returns line number (interface exists)
  ```

  ```bash
  # Agent runs:
  grep -n "R_D:" types.ts
  # Assert: Returns line number (R_D field exists in WorkSchedule)
  ```

  **Evidence to Capture:**
  - [x] `npx tsc --noEmit` 输出无错误

  **Commit**: YES
  - Message: `feat(types): add HolidayDefinition and extend WorkSchedule with R_D`
  - Files: `types.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [x] 2. RxDB schema 与服务层

  **What to do**:
  - 在 `services/db.ts` 中添加 `holidays` 集合 schema
  - 创建 `services/holidayService.ts` 提供 CRUD 操作：
    - `getAllHolidays(): Promise<HolidayDefinition[]>`
    - `saveHoliday(holiday: HolidayDefinition): Promise<void>`
    - `deleteHoliday(id: string): Promise<void>`
    - `initDefaultHolidays(): Promise<void>` (首次使用时填充默认数据)
  - 添加 migration strategy 处理 schema 版本升级
  - 实现日期范围展开函数 `expandHolidayDates(holiday: HolidayDefinition): string[]`
  - 实现 02-29 警告逻辑

  **Must NOT do**:
  - 不要添加复杂的查询逻辑
  - 不要添加外部 API 调用

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 数据层实现，遵循现有模式
  - **Skills**: `[]`
    - 无需特殊技能
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: 不涉及 UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 5, 6, 7
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `services/db.ts:timeConfigSchema` (约 lines 50-80) - RxDB schema 定义模式
  - `services/db.ts:migrationStrategies` - migration 处理模式
  - `services/configService.ts:saveTimeConfig` - upsert 操作模式

  **API/Type References**:
  - `types.ts:HolidayDefinition` - (Task 1 创建) 数据结构定义

  **Test References**:
  - `services/configService.ts` 中的模式可参考，但 holidayService 需要新建测试

  **WHY Each Reference Matters**:
  - `timeConfigSchema` 展示了 RxDB schema 的标准结构（properties, required, primaryKey）
  - `configService` 展示了服务层的 CRUD 操作模式

  **Acceptance Criteria**:

  **TDD (tests enabled):**
  - [x] Test file created: `services/holidayService.test.ts`
  - [x] Test covers: CRUD operations, date expansion, 02-29 warning
  - [x] `npx vitest services/holidayService.test.ts --run` → PASS

  **Automated Verification**:
  ```bash
  # Agent runs:
  npx vitest services/holidayService.test.ts --run
  # Assert: All tests pass
  ```

  ```bash
  # Agent runs:
  grep -n "holidays:" services/db.ts
  # Assert: Returns line number (collection exists in schema)
  ```

  **Evidence to Capture:**
  - [x] Test output showing all tests passed

  **Commit**: YES
  - Message: `feat(db): add holidays collection and holidayService with CRUD operations`
  - Files: `services/db.ts`, `services/holidayService.ts`, `services/holidayService.test.ts`
  - Pre-commit: `npx vitest services/holidayService.test.ts --run`

---

- [x] 3. 默认节假日数据常量

  **What to do**:
  - 在 `constants.tsx` 中添加 `DEFAULT_HOLIDAYS: HolidayDefinition[]`
  - 包含 7 个中国法定节假日：
    - 元旦: 01-01 ~ 01-01
    - 春节: 01-29 ~ 02-04 (农历正月，用户可调整)
    - 清明节: 04-04 ~ 04-06
    - 劳动节: 05-01 ~ 05-05
    - 端午节: 06-10 ~ 06-12 (农历，用户可调整)
    - 中秋节: 09-15 ~ 09-17 (农历，用户可调整)
    - 国庆节: 10-01 ~ 10-07
  - 添加 `DEFAULT_R_D = 0.2` 常量

  **Must NOT do**:
  - 不要添加调休日
  - 不要添加地方性假日

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的常量数据定义
  - **Skills**: `[]`
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 7
  - **Blocked By**: None (can start immediately, but needs HolidayDefinition type from Task 1 for type safety)

  **References**:

  **Pattern References**:
  - `constants.tsx:DEFAULT_TIME_CONFIGS` - 现有默认数据定义模式
  - `constants.tsx:PROVINCES` - 数组常量定义模式

  **Type References**:
  - `types.ts:HolidayDefinition` - (Task 1 创建) 数据结构

  **WHY Each Reference Matters**:
  - `DEFAULT_TIME_CONFIGS` 展示了如何定义带 id 的默认数据数组

  **Acceptance Criteria**:

  **Automated Verification**:
  ```bash
  # Agent runs:
  npx tsc --noEmit
  # Assert: Exit code 0
  ```

  ```bash
  # Agent runs:
  grep -c "DEFAULT_HOLIDAYS" constants.tsx
  # Assert: Returns 1 or more (constant exists)
  ```

  **Evidence to Capture:**
  - [x] TypeScript 编译无错误

  **Commit**: YES (groups with Task 1)
  - Message: `feat(constants): add DEFAULT_HOLIDAYS and DEFAULT_R_D`
  - Files: `constants.tsx`
  - Pre-commit: `npx tsc --noEmit`

---

- [x] 4. 消纳计算核心逻辑扩展

  **What to do**:
  - 修改 `getDayType` 函数：
    - 新增参数 `holidays: string[]` (展开后的 MM-DD 日期列表)
    - 返回类型改为 `'workday' | 'restday' | 'holiday'`
    - 判断逻辑：先检查是否是 holiday（优先级最高），再检查 restday，最后 workday
  - 修改 `getLevel` 函数：
    - 支持 `dayType === 'holiday'` 返回 `'D'`
  - 修改 `solveMonthlyBasePower` 函数：
    - 计算 `N_D`（节假日小时数）
    - 在功率分配中使用 `R_D`
  - 修改 `calculateAlignedConsumption` 函数：
    - 接收 `holidays` 和 `R_D` 参数
    - 在逐小时循环中正确应用 Level D

  **Must NOT do**:
  - 不要修改 TOU 时段逻辑
  - 不要修改电价计算逻辑
  - 不要破坏现有的 A/B/C Level 计算

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 核心计算逻辑修改，需要谨慎处理
  - **Skills**: `[]`
    - 无需特殊技能，但需要理解现有算法
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: 不涉及 UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 5)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `services/consumptionAlignedService.ts:getDayType` (约 lines 45-60) - 当前日期类型判断逻辑
  - `services/consumptionAlignedService.ts:getLevel` (约 lines 62-75) - 当前 Level 判断逻辑
  - `services/consumptionAlignedService.ts:solveMonthlyBasePower` (约 lines 80-130) - 月度功率求解逻辑
  - `services/consumptionAlignedService.ts:calculateAlignedConsumption` (约 lines 150-300) - 主计算函数

  **API/Type References**:
  - `types.ts:WorkSchedule` - 扩展后包含 R_D, selectedHolidayIds
  - `types.ts:DayType` - (Task 1 创建) 日期类型
  - `types.ts:LoadLevel` - (Task 1 创建) 负荷等级

  **Test References**:
  - `services/consumptionAlignedService.test.ts` - 现有测试，需要扩展

  **WHY Each Reference Matters**:
  - `getDayType` 是需要扩展的核心函数，必须理解其当前逻辑
  - `solveMonthlyBasePower` 需要理解 N_A/N_B/N_C 的计算方式以正确添加 N_D
  - 现有测试需要确保不被破坏

  **Acceptance Criteria**:

  **TDD (tests enabled):**
  - [x] Test file updated: `services/consumptionAlignedService.test.ts`
  - [x] Test covers: 
    - getDayType 返回 'holiday' 当日期在节假日列表中
    - holiday 优先级高于 restday（周末节假日返回 'holiday'）
    - getLevel 对 holiday 返回 'D'
    - solveMonthlyBasePower 正确计算 N_D
    - 现有 A/B/C 测试仍然通过（回归测试）
  - [x] `npx vitest services/consumptionAlignedService.test.ts --run` → PASS

  **Automated Verification**:
  ```bash
  # Agent runs:
  npx vitest services/consumptionAlignedService.test.ts --run
  # Assert: All tests pass (including new and existing)
  ```

  **Evidence to Capture:**
  - [x] Test output showing all tests passed
  - [x] 回归测试确认现有功能未破坏

  **Commit**: YES
  - Message: `feat(calc): extend getDayType/getLevel/solveMonthlyBasePower for holiday support`
  - Files: `services/consumptionAlignedService.ts`, `services/consumptionAlignedService.test.ts`
  - Pre-commit: `npx vitest services/consumptionAlignedService.test.ts --run`

---

- [x] 5. useHolidays hook

  **What to do**:
  - 在 `hooks/useDatabase.ts` 中添加 `useHolidays` hook
  - 订阅 RxDB holidays 集合变化
  - 返回 `holidays: HolidayDefinition[]` 和 `loading: boolean`

  **Must NOT do**:
  - 不要添加复杂的状态管理
  - 不要添加缓存逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 遵循现有 hook 模式的简单实现
  - **Skills**: `[]`
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4)
  - **Blocks**: Tasks 6, 7
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `hooks/useDatabase.ts:useTimeConfigs` - 现有 RxDB 订阅 hook 模式

  **Type References**:
  - `types.ts:HolidayDefinition` - (Task 1 创建) 数据类型

  **WHY Each Reference Matters**:
  - `useTimeConfigs` 展示了如何订阅 RxDB 集合并返回数据

  **Acceptance Criteria**:

  **Automated Verification**:
  ```bash
  # Agent runs:
  npx tsc --noEmit
  # Assert: Exit code 0
  ```

  ```bash
  # Agent runs:
  grep -n "useHolidays" hooks/useDatabase.ts
  # Assert: Returns line number (hook exists)
  ```

  **Evidence to Capture:**
  - [x] TypeScript 编译无错误

  **Commit**: YES (groups with Task 2)
  - Message: `feat(hooks): add useHolidays hook for holiday subscription`
  - Files: `hooks/useDatabase.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [x] 6. 节假日管理 UI 组件

  **What to do**:
  - 创建 `components/SelfConsumption/HolidayManager.tsx`
  - 实现 Modal 形式的节假日管理界面：
    - 显示节假日列表（名称、起始日期、结束日期）
    - 添加新节假日（名称输入 + 起始/结束日期选择）
    - 编辑现有节假日
    - 删除节假日（带确认）
  - 日期输入使用简单的 MM-DD 格式文本输入
  - 保存时校验 02-29 并显示警告

  **Must NOT do**:
  - 不要使用复杂的日历选择器组件
  - 不要添加拖拽排序功能
  - 不要添加批量操作

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 组件开发，需要良好的用户体验设计
  - **Skills**: `["frontend-ui-ux"]`
    - `frontend-ui-ux`: 需要设计直观的 Modal 界面
  - **Skills Evaluated but Omitted**:
    - `playwright`: 不需要浏览器自动化测试

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 2, 4, 5

  **References**:

  **Pattern References**:
  - `components/SelfConsumption/index.tsx` - 现有 SelfConsumption 组件结构
  - `components/admin/TimeConfigsManager.tsx` - Modal 和表格管理 UI 模式

  **API/Type References**:
  - `services/holidayService.ts` - (Task 2 创建) CRUD 操作
  - `types.ts:HolidayDefinition` - (Task 1 创建) 数据类型

  **Documentation References**:
  - Tailwind CSS 文档 - Modal 样式

  **WHY Each Reference Matters**:
  - `TimeConfigsManager` 展示了项目中管理类 UI 的标准模式
  - `holidayService` 提供了需要调用的 CRUD 方法

  **Acceptance Criteria**:

  **Automated Verification (using playwright skill)**:
  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173 (或开发服务器端口)
  2. Navigate to 消纳计算页面
  3. Click: "编辑节假日库" 按钮
  4. Wait for: Modal 显示
  5. Assert: 默认节假日列表显示（元旦、春节等）
  6. Fill: 新节假日名称 "测试假日"
  7. Fill: 起始日期 "03-01"
  8. Fill: 结束日期 "03-03"
  9. Click: 添加按钮
  10. Assert: "测试假日" 出现在列表中
  11. Click: 删除 "测试假日"
  12. Assert: "测试假日" 从列表中移除
  13. Screenshot: .sisyphus/evidence/task-6-holiday-manager.png
  ```

  **Evidence to Capture:**
  - [x] Screenshot of Modal with holiday list
  - [x] Screenshot after adding a new holiday

  **Commit**: YES
  - Message: `feat(ui): add HolidayManager component for holiday CRUD`
  - Files: `components/SelfConsumption/HolidayManager.tsx`
  - Pre-commit: `npx tsc --noEmit`

---

- [x] 7. SelfConsumption 页面集成

  **What to do**:
  - 修改 `components/SelfConsumption/index.tsx`
  - 在 WorkSchedule 配置区域添加：
    - R_D 输入框（默认值 0.2）
    - 节假日多选复选框列表
    - "编辑节假日库" 按钮（打开 HolidayManager Modal）
  - 修改 `calculateAlignedConsumption` 调用，传入 holidays 和 R_D
  - 使用 `useHolidays` hook 获取节假日数据
  - 实现日期展开逻辑（调用 `expandHolidayDates`）

  **Must NOT do**:
  - 不要修改现有的 TOU 配置 UI
  - 不要修改电价表选择 UI

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 集成，需要保持一致的用户体验
  - **Skills**: `["frontend-ui-ux"]`
    - `frontend-ui-ux`: 需要将新功能无缝集成到现有 UI
  - **Skills Evaluated but Omitted**:
    - `playwright`: 将在 Task 8 进行端到端测试

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after Task 6)
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 2, 3, 4, 5, 6

  **References**:

  **Pattern References**:
  - `components/SelfConsumption/index.tsx` - 现有页面结构和状态管理
  - `components/SelfConsumption/index.tsx:WorkSchedule` 区域 - R_B/R_C 输入的现有 UI

  **API/Type References**:
  - `services/consumptionAlignedService.ts:calculateAlignedConsumption` - (Task 4 修改) 扩展后的计算函数
  - `hooks/useDatabase.ts:useHolidays` - (Task 5 创建) 节假日数据 hook
  - `services/holidayService.ts:expandHolidayDates` - (Task 2 创建) 日期展开函数

  **WHY Each Reference Matters**:
  - 现有 SelfConsumption 页面是集成目标，需要理解其状态管理和 UI 结构
  - 需要正确调用扩展后的 calculateAlignedConsumption

  **Acceptance Criteria**:

  **Automated Verification (using playwright skill)**:
  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173
  2. Navigate to 消纳计算页面
  3. Assert: R_D 输入框存在，默认值为 0.2
  4. Assert: 节假日复选框列表显示
  5. Check: 勾选 "春节" 和 "国庆节"
  6. Fill: 其他必要的计算参数
  7. Click: 开始计算按钮
  8. Wait for: 计算结果显示
  9. Assert: 计算成功完成
  10. Screenshot: .sisyphus/evidence/task-7-integration.png
  ```

  **Evidence to Capture:**
  - [x] Screenshot of WorkSchedule area with holiday selection

  **Commit**: YES
  - Message: `feat(ui): integrate holiday selection into SelfConsumption page`
  - Files: `components/SelfConsumption/index.tsx`
  - Pre-commit: `npm run build`

---

- [x] 8. 端到端集成测试与验证

  **What to do**:
  - 完整测试流程：
    1. 确认默认节假日已填充
    2. 添加/编辑/删除自定义节假日
    3. 在消纳计算中选择节假日
    4. 执行计算并验证结果
    5. 验证 Level D 在节假日正确应用
  - 运行全量测试确保无回归
  - 验证 build 无错误

  **Must NOT do**:
  - 不要跳过任何测试步骤
  - 不要忽略警告信息

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 验证和测试任务
  - **Skills**: `["playwright"]`
    - `playwright`: 需要浏览器自动化进行端到端测试

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final)
  - **Blocks**: None (final task)
  - **Blocked By**: Task 7

  **References**:

  **All previous tasks' outputs**

  **Acceptance Criteria**:

  **TDD (tests enabled):**
  - [x] `npm run test` → All tests pass
  - [x] `npm run build` → No errors

  **Automated Verification**:
  ```bash
  # Agent runs:
  npm run test
  # Assert: All tests pass
  ```

  ```bash
  # Agent runs:
  npm run build
  # Assert: Exit code 0, no errors
  ```

  **Automated Verification (using playwright skill)**:
  ```
  # Agent executes full E2E flow:
  1. Start dev server
  2. Navigate to 消纳计算页面
  3. Verify default holidays exist
  4. Add a custom holiday "测试假日" (03-15 ~ 03-17)
  5. Select 春节 + 国庆节 + 测试假日
  6. Set R_D = 0.15
  7. Configure other required parameters
  8. Run calculation
  9. Verify calculation completes without errors
  10. Export or inspect results to confirm Level D applied on holiday dates
  11. Screenshot: .sisyphus/evidence/task-8-e2e-complete.png
  ```

  **Evidence to Capture:**
  - [x] `npm run test` output
  - [x] `npm run build` output
  - [x] E2E test screenshots

  **Commit**: YES
  - Message: `test: add e2e verification for holiday configuration feature`
  - Files: Any test files or fixes discovered
  - Pre-commit: `npm run test && npm run build`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(types): add HolidayDefinition and extend WorkSchedule` | types.ts | `npx tsc --noEmit` |
| 2 | `feat(db): add holidays collection and holidayService` | services/db.ts, services/holidayService.ts, services/holidayService.test.ts | `npx vitest services/holidayService.test.ts --run` |
| 3 | `feat(constants): add DEFAULT_HOLIDAYS and DEFAULT_R_D` | constants.tsx | `npx tsc --noEmit` |
| 4 | `feat(calc): extend calculation for holiday support` | services/consumptionAlignedService.ts, *.test.ts | `npx vitest services/consumptionAlignedService.test.ts --run` |
| 5 | `feat(hooks): add useHolidays hook` | hooks/useDatabase.ts | `npx tsc --noEmit` |
| 6 | `feat(ui): add HolidayManager component` | components/SelfConsumption/HolidayManager.tsx | `npx tsc --noEmit` |
| 7 | `feat(ui): integrate holiday selection into SelfConsumption` | components/SelfConsumption/index.tsx | `npm run build` |
| 8 | `test: verify holiday feature end-to-end` | *.test.ts | `npm run test && npm run build` |

---

## Success Criteria

### Verification Commands
```bash
npm run test      # Expected: All tests pass
npm run build     # Expected: No errors, clean build
```

### Final Checklist
- [x] All "Must Have" present:
  - [x] 全局节假日库（RxDB 存储）
  - [x] 节假日 CRUD 管理 UI
  - [x] WorkSchedule 扩展（R_D + selectedHolidayIds）
  - [x] getDayType/getLevel 逻辑扩展
  - [x] 消纳计算中 Level D 的处理
  - [x] 预填充默认节假日数据
  - [x] TDD 测试覆盖核心逻辑
- [x] All "Must NOT Have" absent:
  - [x] 无调休/补班日支持
  - [x] 无按省份区分的节假日
  - [x] 无外部 API 集成
  - [x] 无多年份管理
  - [x] 无节假日独立的 TOU 时段配置
  - [x] 无复杂的日历选择器组件
- [x] All tests pass
- [x] Build succeeds
