# 开发者速查指南：全局省份选择交互统一与数据一致性实践

## 1. 核心逻辑 (Core Logic)

在涉及类似“省份选择”这种既有预设值又需支持用户扩展的场景时，应根据**业务意图**区分交互模式：
*   **录入/配置侧 (Write Side)**：采用 **`input` + `datalist`** 组合。核心在于“宽容”，允许用户输入系统未知的新值（如新省份），兼顾了标准库的便捷选择与边缘情况的灵活性。
*   **消费/计算侧 (Read/Compute Side)**：采用严格的 **`select`** 下拉框。核心在于“防御”，计算逻辑通常依赖已存在的结构化数据，必须从源头杜绝用户输入无效键值（如不存在的省份），避免下游 Null Pointer Exception。
*   **数据源 (Source of Truth)**：所有选项列表（Options）必须动态订阅数据库（如 RxDB）的实时快照，而非硬编码静态常量，确保 UI 总是反映数据的真实状态。

## 2. 避坑指南 (Pitfalls & Fixes)

*   **陷阱一：硬编码的诱惑**
    *   *现象*：为了省事直接用 `const PROVINCES = ['...']` 渲染下拉框。
    *   *后果*：当数据库中通过“灵活录入”产生了新省份（如“海南省”）时，硬编码的下拉框里找不到它，导致数据无法显示或无法关联。
    *   *修正*：优先使用 `useMemo` 从数据库全量数据中提取去重后的键值列表作为 Option 源。

*   **陷阱二：Datalist 的浏览器差异**
    *   *现象*：`datalist` 在不同浏览器（尤其是 Safari 与 Chrome）上的样式渲染差异巨大，有时只显示 value 不显示 label。
    *   *修正*：尽量只使用 `value` 属性存放核心展示文本，避免依于 `label` 属性做辅助展示，或使用成熟的 UI 组件库（如 shadcn/ui Combobox）替代原生标签。

*   **陷阱三：RxDB 的严格 Schema**
    *   *现象*：在修复组件时临时拼凑对象写入数据库，报错 `validation error`。
    *   *后果*：`last_modified` 等系统字段遗漏，导致数据静默写入失败。
    *   *修正*：始终使用统一的工厂函数或扩展类型定义，确保所有必填系统字段在对象创建时刻即被填充。

## 3. 复用模版 (Reusable Snippets)

### 灵活录入组件 (Input + Datalist Pattern)

适用于：手动录入、配置编辑等需要“既选且输”的场景。

```tsx
import React from 'react';

// 假设从数据库 hook 获取的动态列表
const useProvinceOptions = (data: any[]) => {
  return React.useMemo(() => {
    // 提取并去重，混合静态常量与动态数据
    const dbProvinces = new Set(data.map(item => item.province));
    const allOptions = Array.from(new Set([...PROVINCES, ...dbProvinces])).sort();
    return allOptions;
  }, [data]);
};

export const FlexibleSelect = ({ value, onChange, options }) => (
  <div className="relative">
    <input
      list="dynamic-options-id" 
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="选择或输入..."
      className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
    />
    <datalist id="dynamic-options-id">
      {options.map(opt => (
        <option key={opt} value={opt} />
      ))}
    </datalist>
  </div>
);
```

### 严格选择组件 (Strict Select Pattern)

适用于：计算器、分析图表等强依赖已有数据的场景。

```tsx
export const StrictSelect = ({ value, onChange, dbData }) => {
   // 仅从数据库中提取有效选项
   const validOptions = React.useMemo(() => 
     Array.from(new Set(dbData.map(d => d.province))).sort()
   , [dbData]);

   return (
     <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full p-2.5 border rounded-lg bg-slate-50"
     >
        {validOptions.length > 0 ? (
           validOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)
        ) : (
           <option disabled>暂无有效数据</option>
        )}
     </select>
   );
};
```
