# CSV 导出字段修复

## TL;DR

> **快速摘要**: 修复消纳分析 CSV 导出中的字段显示问题
> 
> **问题**:
> 1. 时段列显示英文（tip/peak/flat/valley/deep），需改为中文（尖/峰/平/谷/深谷）
> 2. 确认日类型和电价列正常输出
>
> **交付物**: `utils/exportUtils.ts` 中 `exportSelfConsumptionHourlyCSV` 函数修复
>
> **预计工作量**: Quick（5分钟）
> **并行执行**: NO

---

## TODOs

- [ ] 1. 修复时段列中文映射

  **What to do**:
  在 `utils/exportUtils.ts` 的 `exportSelfConsumptionHourlyCSV` 函数中：
  
  找到这段代码（约第 137-138 行）：
  ```typescript
  // 时段（直接输出 touType）
  const touType = aligned.touType;
  ```
  
  替换为：
  ```typescript
  // 时段映射为中文
  const touTypeMap: Record<string, string> = {
    tip: '尖',
    peak: '峰',
    flat: '平',
    valley: '谷',
    deep: '深谷',
  };
  const touTypeLabel = touTypeMap[aligned.touType] || aligned.touType;
  ```
  
  然后在第 152 行的 CSV 行拼接中，把 `${touType}` 改为 `${touTypeLabel}`：
  ```typescript
  return `${timeStr},${aligned.month},${aligned.day},${aligned.hour},${dayTypeLabel},${touTypeLabel},${loadKwh},${pvKwh},${selfKwh},${gridExportKwh},${gridImportKwh},${unitPrice},${importCost},${exportRevenue}`;
  ```

  **References**:
  - `utils/exportUtils.ts:127-153` — 当前逐时 CSV 生成逻辑

  **Acceptance Criteria**:
  - [ ] 导出 CSV 后，时段列显示中文（尖/峰/平/谷/深谷）
  - [ ] 日类型列显示中文（工作日/休息日）
  - [ ] 电价列有数值（不全是 0.00）
  - [ ] `npm run build` 通过

  **Commit**: YES
  - Message: `fix(export): map touType to Chinese labels in hourly CSV`
  - Files: `utils/exportUtils.ts`

---

## 验证

```bash
npm run build  # 无 TS 错误
```

手动验证：
1. 运行 `npm run dev`
2. 进入"光伏消纳分析"，运行分析
3. 点击"导出逐时明细"
4. 打开 CSV，确认：
   - 时段列：尖/峰/平/谷/深谷
   - 日类型列：工作日/休息日
   - 单价列：有非零数值
