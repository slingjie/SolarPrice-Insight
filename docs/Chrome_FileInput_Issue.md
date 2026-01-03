# Chrome 文件导入功能失效 - 问题上下文

> 供其他 AI 或开发者参考的调试上下文

---

## 问题描述

在 `SolarPrice-Insight` 项目的数据管理模块中，**文件导入功能在 Safari 中正常工作，但在 Chrome 中点击导入按钮无法弹出文件选择框**。

---

## 涉及文件

1. `/components/admin/BackupRestore.tsx` - 全量备份与恢复
2. `/components/admin/DataImportExport.tsx` - 分类数据导入导出

---

## 当前代码实现（BackupRestore.tsx 示例）

```tsx
<label className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 cursor-pointer">
    <input
        type="file"
        accept=".json"
        onChange={handleRestoreAll}
        className="sr-only"
    />
    <Upload size={20} /> 选择备份文件
</label>
```

---

## 已尝试的方案（均无效）

| 方案 | 实现方式 | 结果 |
|------|----------|------|
| 1. 透明叠加层 | `<input className="opacity-0 absolute inset-0">` 覆盖在按钮上 | Chrome 无反应 |
| 2. Ref + button.onClick | 使用 `useRef` 获取 input，在 button 点击时调用 `ref.current.click()` | Chrome 无反应 |
| 3. Ref + dispatchEvent | 使用 `new MouseEvent('click')` 派发事件 | Chrome 无反应 |
| 4. label htmlFor + input id | `<label htmlFor="xxx">` 关联 `<input id="xxx">` | Chrome 无反应 |
| 5. label 嵌套 input（当前） | `<label><input .../></label>` 原生嵌套关联 | Chrome 无反应，Safari 正常 |

---

## 环境信息

- **框架**: React 18 + Vite
- **样式**: Tailwind CSS
- **浏览器**: 
  - Safari: 正常
  - Chrome (Mac): 点击按钮无反应，无控制台报错
  - Antigravity 内置浏览器（沙盒模式）: 无反应（预期行为）

---

## 可能的原因猜测

1. **Chrome 安全策略**：Chrome 对脚本触发的 file input 点击有严格限制，但原生 `<label>` 内嵌套 `<input>` 理论上不应被拦截
2. **Vite HMR 问题**：热更新后事件绑定可能失效
3. **CSS `sr-only` 或其他样式**：某些隐藏方式可能导致 Chrome 忽略元素
4. **React 合成事件干扰**：React 的事件系统可能与原生事件有冲突

---

## 调试建议

1. 在 Chrome DevTools Elements 面板检查 DOM 结构是否正确
2. 在 Console 中手动执行：`document.querySelector('input[type="file"]').click()` 测试是否弹出选择框
3. 检查是否有 Chrome 扩展程序（如广告拦截器）干扰
4. 尝试在 Chrome 隐身模式下测试
5. 尝试完全刷新页面（Cmd+Shift+R）而非热更新

---

## 期望结果

点击"选择备份文件"或"导入 xxx 数据"按钮时，Chrome 应弹出系统文件选择对话框。

---

## 已采用的解决方案（2026-01-03）

在 Chromium 内核浏览器（如 Chrome）上优先使用 **File System Access API**（`window.showOpenFilePicker()`）来打开文件选择器，绕开 `label + input[type=file]` 在部分环境下被静默拦截的问题；在不支持该 API 的浏览器（如 Safari）则回退到原生 `input[type=file]` 的 `onChange` 流程。

- 同时，导出侧在 Chrome 上优先使用 `window.showSaveFilePicker()`，避免部分环境里 `a.click()` 下载被静默拦截。
- 代码落点：
  - `components/admin/BackupRestore.tsx`
  - `components/admin/DataImportExport.tsx`
  - `utils/fileDialog.ts`

### 重要说明：Chrome “File picker already active”

在少数 Chrome 环境中，File Picker 可能进入卡死态并报错：`NotAllowedError: ... File picker already active`，表现为点击导入/保存无弹窗或无反应。

- 处理策略：
  1. 导出侧已自动回退到 `<a download>` 方案（仍可正常下载）。
  2. 导入侧提供了拖拽导入：将 `.json` 文件直接拖到导入按钮上松开即可。
  3. 页面内会显示调试信息面板，并把失败信息写入“操作日志”。

---

## 相关代码位置

- `BackupRestore.tsx`: 搜索 `handlePickRestoreFile` / `canUseOpenFilePicker`
- `DataImportExport.tsx`: 搜索 `handlePickImport` / `canUseOpenFilePicker`

---

*文档创建时间：2026-01-03*
