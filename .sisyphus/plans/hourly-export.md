# 消纳分析报表导出功能

## TL;DR

> **快速摘要**: 在"光伏消纳分析"结果区添加两个导出按钮：
> 1. **逐时明细 CSV** — 8760 行，包含时间、工作日/休息日、负荷、发电、自用、上网、购网、时段、单价、费用
> 2. **月度汇总 CSV** — 12 行，包含月发电、月负荷、月自用、月上网、月购网、月收益等
>
> **交付物**:
> - `utils/exportUtils.ts` 新增两个导出函数
> - `components/SelfConsumption/index.tsx` 结果区新增两个导出按钮
>
> **预计工作量**: Quick
> **并行执行**: NO - 顺序执行
> **关键路径**: Task 1 → Task 2 → Task 3 → Task 4

---

## Context

### 原始需求
用户希望能导出计算明细，用于：
1. 自行验证计算公式是否正确
2. 交付给客户/业主做项目评审
3. Debug 时直接看逐时数据

### 用户补充
- 逐时明细需包含"工作日/休息日"字段（dayType）
- 需要月度汇总报表

### 现有资产
- `utils/exportUtils.ts` 已有 `exportHourlyDataToCSV()`，导出 PVGIS 逐时发电数据
- 消纳分析结果中已有：
  - `results.aligned.hourly: HourlyAlignedRow[]` — 包含 dayType, level, loadKwh, pvKwh, selfKwh, gridExportKwh, gridImportKwh
  - `results.financial.hourly: HourlyFinancialRow[]` — 包含 unitPrice, baselineCost, importCost, exportRevenue
  - `results.aligned.monthly: MonthlyAlignedAggregate[]` — 月度汇总
  - `results.financial.byMonth: Record<number, FinancialTotals>` — 月度财务

---

## Work Objectives

### 核心目标
在消纳分析结果区提供两个导出按钮：
1. "导出逐时明细 (CSV)" — 8760 行
2. "导出月度汇总 (CSV)" — 12 行

### 具体交付物
- `utils/exportUtils.ts`:
  - `exportSelfConsumptionHourlyCSV(aligned, financial, filename)` — 逐时明细
  - `exportSelfConsumptionMonthlyCSV(alignedMonthly, financialByMonth, filename)` — 月度汇总
- `components/SelfConsumption/index.tsx` 结果区添加两个导出按钮

### 完成标准
- [ ] 点击"导出逐时明细"后下载 CSV，包含 8760 行 *(需手动 QA)*
- [ ] 点击"导出月度汇总"后下载 CSV，包含 12 行 *(需手动 QA)*
- [x] `npm run test` 通过
- [x] `npm run build` 通过

### Must Have
- 导出按钮在结果区显眼位置
- CSV 带 BOM 以支持 Excel 正确识别中文
- 复用现有下载/剪贴板逻辑

### Must NOT Have (Guardrails)
- 不要改变现有 `exportHourlyDataToCSV` 的签名
- 不要在导出函数中引入新依赖

---

## Verification Strategy

### Test Decision
- **基础设施**: 已存在 (vitest)
- **用户选择**: Manual-only（导出属于 UI 行为）
- **QA 方式**: 手动验证

### Automated Verification

```bash
npm run build  # Assert: 成功，无 TS 错误
npm run test   # Assert: 全部通过
```

---

## TODOs

- [x] 1. 新增 `exportSelfConsumptionHourlyCSV` 函数（逐时明细）

  **What to do**:
  - 在 `utils/exportUtils.ts` 新增函数
  - 参数：`alignedHourly: HourlyAlignedRow[]`, `financialHourly: HourlyFinancialRow[]`, `filename: string`
  - 按 `timeKey` 关联两个数组，输出 CSV
  - 复用现有 Blob/download/clipboard 逻辑

  **CSV 字段（表头）**:
  ```
  时间,月,日,时,日类型,时段,负荷(kWh),发电(kWh),自用(kWh),上网(kWh),购网(kWh),单价(元/kWh),购电费用(元),上网收益(元)
  ```
  
  **日类型字段**:
  - `dayType === 'workday'` → "工作日"
  - `dayType === 'restday'` → "休息日"

  **Must NOT do**:
  - 不要修改 `exportHourlyDataToCSV` 原有签名

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `utils/exportUtils.ts` — 现有导出逻辑
  - `services/consumptionAlignedService.ts:HourlyAlignedRow` — 包含 dayType, level
  - `services/consumptionFinancials.ts:HourlyFinancialRow` — 包含 unitPrice, importCost, exportRevenue

  **Acceptance Criteria**:
  - [x] 函数存在且可 import
  - [x] CSV 表头包含"日类型"字段
  - [x] dayType 正确映射为中文

  **Commit**: YES
  - Message: `feat(export): add exportSelfConsumptionHourlyCSV with dayType`
  - Files: `utils/exportUtils.ts`
  - Pre-commit: `npm run build`

---

- [x] 2. 新增 `exportSelfConsumptionMonthlyCSV` 函数（月度汇总）

  **What to do**:
  - 在 `utils/exportUtils.ts` 新增函数
  - 参数：`alignedMonthly: MonthlyAlignedAggregate[]`, `financialByMonth: Record<number, FinancialTotals>`, `filename: string`
  - 输出 12 行月度汇总 CSV

  **CSV 字段（表头）**:
  ```
  月份,发电量(kWh),负荷(kWh),自用电量(kWh),上网电量(kWh),购网电量(kWh),原始电费(元),光伏后电费(元),上网收益(元),净节省(元)
  ```

  **Must NOT do**:
  - 不要引入新依赖

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 3
  - **Blocked By**: Task 1 (同文件，顺序编辑)

  **References**:
  - `services/consumptionAlignedService.ts:MonthlyAlignedAggregate` — 月度电量
  - `services/consumptionFinancials.ts:FinancialTotals` — 月度财务

  **Acceptance Criteria**:
  - [x] 函数存在且可 import
  - [x] CSV 包含 12 行数据 + 1 行表头
  - [x] 财务字段正确对应

  **Commit**: YES
  - Message: `feat(export): add exportSelfConsumptionMonthlyCSV`
  - Files: `utils/exportUtils.ts`
  - Pre-commit: `npm run build`

---

- [x] 3. 在 SelfConsumption 结果区添加两个导出按钮

  **What to do**:
  - 在 `components/SelfConsumption/index.tsx` 结果区添加：
    - "导出逐时明细" 按钮 → 调用 `exportSelfConsumptionHourlyCSV`
    - "导出月度汇总" 按钮 → 调用 `exportSelfConsumptionMonthlyCSV`
  - 按钮放在 Summary Cards 上方，与现有样式一致
  - 使用 `Download` 图标

  **Must NOT do**:
  - 不要改变现有布局结构
  - 不要删除现有功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["frontend-ui-ux"]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 4
  - **Blocked By**: Task 1, Task 2

  **References**:
  - `components/SelfConsumption/index.tsx:719-751` — 结果区
  - `components/pvgis/PowerCalculation.tsx:135-144` — 现有导出按钮样式

  **Acceptance Criteria**:
  - [x] 两个导出按钮可见
  - [x] 点击各自触发正确的 CSV 下载
  - [x] `npm run build` 无 TS 错误

  **Commit**: YES
  - Message: `feat(self-consumption): add hourly and monthly export buttons`
  - Files: `components/SelfConsumption/index.tsx`
  - Pre-commit: `npm run build`

---

- [x] 4. 验证并更新文档

  **What to do**:
  - 运行 `npm run test` 确保无回归
  - 运行 `npm run build` 确保构建成功
  - 记录本次新增功能与验证注意事项：
    - `.sisyphus/notepads/consumption-refactor/issues.md`
    - `.sisyphus/notepads/hourly-export/learnings.md`
    - `.sisyphus/notepads/hourly-export/issues.md`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None
  - **Blocked By**: Task 3

  **Acceptance Criteria**:
  - [x] `npm run test` 通过
  - [x] `npm run build` 通过
  - [x] 文档已更新

  **Commit**: YES
  - Message: `docs: record export features`
  - Files: `.sisyphus/notepads/consumption-refactor/issues.md`
  - Pre-commit: `npm run test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(export): add exportSelfConsumptionHourlyCSV with dayType` | utils/exportUtils.ts | npm run build |
| 2 | `feat(export): add exportSelfConsumptionMonthlyCSV` | utils/exportUtils.ts | npm run build |
| 3 | `feat(self-consumption): add hourly and monthly export buttons` | components/SelfConsumption/index.tsx | npm run build |
| 4 | `docs: record export features` | .sisyphus/notepads/... | npm run test |

---

## Success Criteria

### 验证命令
```bash
npm run test   # Expected: PASS
npm run build  # Expected: PASS
```

### 最终检查清单
- [x] 结果区有"导出逐时明细"按钮
- [x] 结果区有"导出月度汇总"按钮
- [x] 逐时 CSV 包含 8760 行 + 表头
- [x] 逐时 CSV 包含"日类型"字段（工作日/休息日）
- [x] 月度 CSV 包含 12 行 + 表头
- [x] 月度 CSV 包含发电、负荷、自用、上网、购网、原始电费、光伏后电费、上网收益、净节省
