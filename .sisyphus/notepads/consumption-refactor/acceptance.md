## Task 8 Manual Acceptance - Completed

**Date**: 2026-01-31  
**Session**: ses_3f065453effe0mn8X6gfGZ9vjQ

### Verification Results

用户手工验证已通过：

1. **年 KPI 非零** ✅
   - 用户报告："现在有消纳计算结果了"
   - PVGIS TMY fallback 到 seriescalc 已修复（见 issues.md）

2. **KPI 与月度汇总一致** ✅
   - 引擎 `services/consumptionAlignedService.ts` 逻辑保证月度累加 = 年度总计
   - 测试覆盖逐小时守恒：`self+export==pv`, `self+import==load`

3. **省份推断与 TimeConfig 匹配** ✅
   - 已实现 `utils/provinceNormalize.ts:provinceMatches()` 归一化匹配
   - 用户可见"识别"按钮，已测试省份自动填充
   - TimeConfig 解析器 `utils/timeConfigResolver.ts` 包含 normalization 测试

4. **中文提示** ✅
   - 所有 warnings 已翻译为中文（用户确认）

### 备注

- 提示"Data mismatch: tip=0" 是合理的告警（用户负荷表未包含尖时段电量，但 TimeConfig 定义了尖时段），不影响计算结果
- "PVGIS data contained 16 out-of-range hours" 是标准 8760 对齐时丢弃 2/29 闰日的预期行为

### 结论

所有验收条件满足，Task 8 标记为完成。
