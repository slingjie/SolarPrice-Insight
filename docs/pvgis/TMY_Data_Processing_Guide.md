# 开发者速查指南：TMY 典型年数据处理与时间对齐

## 1. 核心逻辑

处理 TMY (Typical Meteorological Year) 数据时，解决“跨时区显示不连续”与“多年份混合导致过滤失效”的关键思路：

- **循环移位排序 (Circular Shift)**：当由 UTC 切换至本地时间（如 UTC+8）时，TMY 数据的年末最后 8 小时实际上是本地时间次年的年初。通过自定义排序权重 `Month*10000 + Day*100 + Hour`（基于本地时间计算），将这部分数据循环移动到数组头部，保证展示层面的日期连续性（00:00-23:00）。
- **年忽略键 (IgnoreYear DayKey)**：TMY 数据的不同月份可能来自不同年份（如12月是2010年，1月是2015年）。日内曲线过滤必须使用 `MM-DD` 格式的 Key 替代 `YYYY-MM-DD`，否则年份冲突会导致无法找全 24 小时记录。
- **派生候选项**：不使用日期选择器组件，而是从处理后的 8760 小时数据中通过 `Set` 提取所有存在的 `DayKey` 作为下拉列表选项，确保“所见即所得”。

## 2. 避坑指南

- **原生 Date Input 陷阱**：`<input type="date">` 强制要求 `YYYY-MM-DD` 格式。在 TMY 模式下，即便你强行拼凑一个年份（如 `0000-01-01`），浏览器也可能因由于不合法日期或年份范围限制导致无法赋值或显示异常。建议直接使用 `<select>` 下拉框适配 `MM-DD` 字符串。
- **UTC 边界断裂**：在 UTC+8 模式下，第一天（1-1）的 00:00-07:59 是原始数据的 12-31 16:00-23:59。如果仅简单过滤“月份=1”，会导致 1 月 1 日的前 8 小时消失。必须先对全量 8760 条数据进行本地化重新排序，再进行 UI 过滤。

## 3. 复用模版

### TMY 时间对齐排序逻辑 (React/TypeScript)

```typescript
// 将 8760 小时数据按本地时间逻辑重新排列
const processedData = useMemo(() => {
    if (!result) return [];
    let data = [...result.data];

    if (queryType === 'tmy' && timeMode === 'cn') {
        data.sort((a, b) => {
            const pa = getTimeParts(a.time, 'cn'); // 获取本地时间分量
            const pb = getTimeParts(b.time, 'cn');
            if (!pa || !pb) return 0;
            
            // 计算本地时间轴上的绝对权重
            const valA = pa.m * 10000 + pa.d * 100 + pa.hh;
            const valB = pb.m * 10000 + pb.d * 100 + pb.hh;
            return valA - valB;
        });
    }
    return data;
}, [result, timeMode, queryType]);
```

### 健壮的日期 Key 生成器

```typescript
function dayKey(timeIso: string, mode: 'utc'|'cn', ignoreYear: boolean): string {
    const p = getTimeParts(timeIso, mode);
    if (!p) return '';
    const mm = String(p.m).padStart(2, '0');
    const dd = String(p.d).padStart(2, '0');
    if (ignoreYear) {
        return `${mm}-${dd}`; // 适用于 TMY 混合年份
    }
    return `${p.y}-${mm}-${dd}`; // 适用于 SeriesCalc 连续序列
}
```
