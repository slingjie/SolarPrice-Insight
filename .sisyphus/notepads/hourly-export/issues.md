# hourly-export issues

- Manual QA blocker: SelfConsumption export buttons render only after analysis results exist, but analysis is blocked when the selected province has no tariff data (UI shows "no tariff data").
  - Workaround: import/generate tariff data for the province/category/voltage, then rerun analysis and click both exports.

- **FIXED**: CSV 时段列显示英文（tip/peak/flat/valley/deep）改为中文（尖/峰/平/谷/深谷）
  - File: `utils/exportUtils.ts`
  - Solution: Added `touTypeMap` mapping in `exportSelfConsumptionHourlyCSV` function (line ~137-145)
  - Maps: tip→尖, peak→峰, flat→平, valley→谷, deep→深谷
  - Updated CSV row generation to use `touTypeLabel` instead of raw `touType`
  - Verified: `npm run build` passes (no TypeScript errors)
- **NEEDS QA**: Manual verification of CSV export after touType fix
  - Action: Run analysis → Export hourly CSV → Open in Excel
  - Expected: 时段 column displays: 尖/峰/平/谷/深谷 (not tip/peak/flat/valley/deep)
  - Also verify: 日类型 shows 工作日/休息日, 单价 has non-zero values

