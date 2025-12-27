# 开发者速查指南：复杂 UI 交互与编辑增强

本指南总结了在处理“识别结果可编辑化”与“分时段规则回填编辑”任务中的核心实践。

## 1. 核心逻辑

*   **状态提升与局部副本**：在处理批次数据（如 OCR 识别列表）时，将数据存入局部状态 `batches`，并提供索引化的更新函数（如 `updateOcrItem`），以支持逐项颗粒度编辑。
*   **回填模式 (Editing State)**：通过 `editingRuleIndex` 或类似的 ID 标记当前处于“编辑模式”，点击列表项时触发数据回填到输入表单，使“添加员”变身为“更新员”。
*   **冒泡隔离原则**：在可点击的列表项 (`onClick`) 中嵌套输入组件或操作按钮时，必须使用 `e.stopPropagation()`，防止触发非预期的选中状态切换。
*   **排序驱动视图**：对时段等对顺序敏感的数据，在任何插入或编辑操作后强制执行 `sort()`，确保视图的一致性和逻辑正确性。

## 2. 避坑指南

*   **非语义化标签嵌套错误**：在快速重构中，容易出现 `<div>` 与组件标签（如 `<Card>`）嵌套闭合不一致。**修正方法**：使用 IDE 的“格式化代码”功能强行检测缩进异常，并在编辑大段 JSX 前先对齐结构。
*   **输入框失焦与状态重载**：在循环渲染输入框时，若直接使用索引更新大状态，可能导致组件因 key 变化重新挂载而失焦。**修正方法**：确保 `key` 的稳定性（如使用 `id` 而非 `index`），并控制更新函数的粒度。
*   **删除项的索引漂移**：在编辑某一项时若另一项被删除，若使用 `index` 追踪编辑状态会导致偏移。**修正方法**：删除逻辑中应检查并重置 `editingRuleIndex`。

## 3. 复用模版：回填编辑逻辑模版

```typescript
// 1. 状态定义
const [list, setList] = useState<Item[]>([]);
const [editingIndex, setEditingIndex] = useState<number | null>(null);
const [form, setForm] = useState<Item>(initValue);

// 2. 回填逻辑
const selectToEdit = (index: number) => {
  setForm(list[index]);
  setEditingIndex(index);
};

// 3. 处理函数（合一）
const handleSubmit = () => {
  let newList = [...list];
  if (editingIndex !== null) {
    newList[editingIndex] = form; // 编辑更新
    setEditingIndex(null);
  } else {
    newList.push(form); // 新增
  }
  setList(newList.sort(mySortFunc));
  setForm(initValue); // 重置
};
```

---
*文档保存于: docs/UI_Interaction_Guide.md*
