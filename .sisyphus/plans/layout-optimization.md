# Layout Optimization for SolarPrice Insight

## TL;DR

> **Quick Summary**: 优化消纳分析页面布局，使其在大屏幕(≥1536px)上全宽铺开，同时调整左右栏比例为4:8。移除全局max-w约束，让各页面自行控制宽度。
> 
> **Deliverables**: 
> - App.tsx 移除全局 max-w-7xl 约束
> - 4个"孤儿页面"添加独立的宽度约束
> - SelfConsumption 页面实现响应式全宽布局
> - 左右栏比例从 5:7 调整为 4:8
> 
> **Estimated Effort**: Quick (15-20分钟)
> **Parallel Execution**: NO - sequential (依赖顺序执行)
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4

---

## Context

### Original Request
用户反馈消纳分析界面的布局居中且狭窄，没有充分利用页面宽度，整体效果不理想。

### Interview Summary
**Key Discussions**:
- 布局风格: 用户选择「自适应宽度」- 小屏居中，大屏(>1536px)全宽铺开
- 栏位比例: 调整为 4:8 - 左侧输入区更紧凑，右侧预览区更大
- 优化范围: 全局布局优化 - 移除 App.tsx 全局约束

**Research Findings**:
- 问题根因是「双重宽度约束」：App.tsx:204 和 SelfConsumption/index.tsx:435 都有 `max-w-7xl mx-auto`
- 侧边栏偏移 `ml-20 lg:ml-64` 进一步压缩可用宽度
- 在 1920px 屏幕上，实际可用内容宽度仅约 1024px（53%）

### Metis Review
**Identified Gaps** (addressed):
- **关键发现**: 4个"孤儿页面"(Dashboard, TimeConfig, Analysis, PVGISModule)没有自己的 max-w 约束，依赖 App.tsx 的全局约束。如果直接移除全局约束，这些页面会意外扩展到全宽。
- **解决方案**: 先为这4个页面添加独立的 max-w-7xl mx-auto 包装，再移除全局约束。

---

## Work Objectives

### Core Objective
优化布局系统，使消纳分析页面在大屏幕上全宽铺开，同时保持其他页面的现有布局行为。

### Concrete Deliverables
- `App.tsx`: 移除 line 204 的 `max-w-7xl mx-auto`
- `Dashboard.tsx`, `TimeConfig.tsx`, `Analysis.tsx`, `PVGISModule.tsx`: 添加独立的 max-w-7xl 包装
- `SelfConsumption/index.tsx`: 响应式宽度 `max-w-7xl 2xl:max-w-none mx-auto` + 栏位比例 4:8

### Definition of Done
- [x] `npm run build` 无错误
- [x] 1536px以下屏幕: 消纳分析页面居中显示（max-w-7xl）
- [x] 1920px+屏幕: 消纳分析页面全宽显示
- [x] 左右栏比例为 4:8
- [x] Dashboard, TimeConfig, Analysis 等页面保持居中（max-w-7xl）

### Must Have
- 移除 App.tsx 的全局 max-w-7xl 约束
- 为孤儿页面添加独立的宽度约束（防止意外全宽）
- SelfConsumption 实现响应式全宽
- 栏位比例调整为 4:8

### Must NOT Have (Guardrails)
- ❌ 不修改侧边栏偏移量 (`ml-20 lg:ml-64`)
- ❌ 不修改其他页面的内部组件布局
- ❌ 不为 2xl 以外添加中间断点
- ❌ 不修改 AdminModule 或 PVGISModule 的内部布局
- ❌ 不移除 App.tsx:275 的 `-m-4 lg:-m-8` hack（保留为后续任务）

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (vitest)
- **User wants tests**: Manual-only（视觉布局验证）
- **Framework**: N/A for this task

### Automated Verification Only (NO User Intervention)

每个 TODO 包含可执行的验证步骤：

| Type | Verification Tool | Automated Procedure |
|------|------------------|---------------------|
| **Build** | Bash | `npm run build` → Exit code 0 |
| **Code Grep** | Grep | 验证特定类名存在于目标文件 |
| **Frontend/UI** | Playwright via skill | 多视口宽度下的 DOM 测量 |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Sequential - Order Critical):
├── Task 1: 为孤儿页面添加 max-w-7xl 包装 [无依赖]
├── Task 2: 移除 App.tsx 全局约束 [依赖: Task 1]
├── Task 3: 优化 SelfConsumption 响应式布局 [依赖: Task 2]
└── Task 4: 验证并提交 [依赖: Task 3]

Critical Path: Task 1 → Task 2 → Task 3 → Task 4
Parallel Speedup: N/A (依赖链)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2 | None |
| 2 | 1 | 3 | None |
| 3 | 2 | 4 | None |
| 4 | 3 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1→2→3→4 | delegate_task(category="quick", load_skills=["frontend-ui-ux"], run_in_background=false) |

---

## TODOs

- [x] 1. 为孤儿页面添加独立的 max-w-7xl 包装

  **What to do**:
  - 在 `Dashboard.tsx` 最外层添加 `<div className="max-w-7xl mx-auto">` 包装
  - 在 `TimeConfig.tsx` 最外层添加相同的包装
  - 在 `Analysis.tsx` 最外层添加相同的包装
  - 注意：PVGISModule 不需要修改（它有自己的布局系统且在 view==='pvgis' 时不受 App.tsx 约束）

  **Must NOT do**:
  - 不修改组件的内部结构
  - 不添加任何额外样式或功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的包装器添加，每个文件只需一行改动
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 理解 Tailwind 布局模式

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 1, Step 1)
  - **Blocks**: Task 2
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `components/SmartUpload.tsx:239` - 已有 `max-w-5xl mx-auto` 模式参考
  - `components/ManualEntry.tsx:257` - 已有 `max-w-4xl mx-auto` 模式参考

  **Files to Modify**:
  - `components/Dashboard.tsx` - 需要在返回的 JSX 最外层添加包装
  - `components/TimeConfig.tsx` - 同上
  - `components/Analysis.tsx` - 同上

  **WHY Each Reference Matters**:
  - SmartUpload/ManualEntry 展示了正确的包装模式：在组件根元素添加 max-w + mx-auto

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  grep -n "max-w-7xl mx-auto" components/Dashboard.tsx
  # Assert: 找到至少一行包含 max-w-7xl mx-auto

  grep -n "max-w-7xl mx-auto" components/TimeConfig.tsx
  # Assert: 找到至少一行

  grep -n "max-w-7xl mx-auto" components/Analysis.tsx
  # Assert: 找到至少一行

  npm run build
  # Assert: Exit code 0
  ```

  **Evidence to Capture:**
  - [ ] grep 命令输出确认类名存在
  - [ ] build 命令输出确认无错误

  **Commit**: NO (groups with Task 4)

---

- [x] 2. 移除 App.tsx 全局 max-w-7xl 约束

  **What to do**:
  - 定位 `App.tsx:204` 的 `<div className="max-w-7xl mx-auto">`
  - 移除 `max-w-7xl mx-auto`，保留其他类名（如果有）或改为 `<div>`
  - 如果该 div 只有 `max-w-7xl mx-auto` 这个类，可以直接移除整个 div 元素或改为 Fragment

  **Must NOT do**:
  - 不移除 App.tsx:275 的 `-m-4 lg:-m-8`（保留给后续任务）
  - 不修改 App.tsx 的任何其他逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件单行修改
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 理解布局约束的影响

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 1, Step 2)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:

  **Files to Modify**:
  - `App.tsx:204` - 包含 `<div className="max-w-7xl mx-auto">` 的行

  **Code Context** (current state):
  ```tsx
  // App.tsx:203-205
  <main className={`flex-1 ${view !== 'pvgis' && view !== 'admin' && view !== 'self-consumption' ? 'ml-20 lg:ml-64' : ''} p-4 lg:p-8 overflow-y-auto min-h-screen`}>
    <div className="max-w-7xl mx-auto">  // ← 移除此约束
      {view === 'dashboard' && (
  ```

  **WHY This Change**:
  - 移除全局约束后，各页面使用自己的宽度控制（Task 1 已添加）
  - 消纳分析页面可以实现响应式全宽

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  grep -n "max-w-7xl mx-auto" App.tsx | head -5
  # Assert: 不再包含 line 204 的全局约束（或输出为空）

  npm run build
  # Assert: Exit code 0
  ```

  **Evidence to Capture:**
  - [ ] grep 命令确认移除成功
  - [ ] build 成功

  **Commit**: NO (groups with Task 4)

---

- [x] 3. 优化 SelfConsumption 页面响应式布局

  **What to do**:
  - 在 `SelfConsumption/index.tsx:435` 将 `max-w-7xl mx-auto` 改为 `max-w-7xl 2xl:max-w-none mx-auto`
  - 在 `SelfConsumption/index.tsx:448` 将 `lg:col-span-5` 改为 `lg:col-span-4`
  - 在 `SelfConsumption/index.tsx:811` 将 `lg:col-span-7` 改为 `lg:col-span-8`
  - 为主容器添加 `data-testid="sc-container"` 以便验证

  **Must NOT do**:
  - 不修改侧边栏偏移量
  - 不添加 2xl 以外的断点

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 定点修改 4 处类名
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Tailwind 响应式断点专业知识

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 1, Step 3)
  - **Blocks**: Task 4
  - **Blocked By**: Task 2

  **References**:

  **Files to Modify**:
  - `components/SelfConsumption/index.tsx`
    - Line 435: 容器宽度约束
    - Line 448: 左栏 span
    - Line 811: 右栏 span

  **Tailwind Responsive Pattern**:
  - `2xl:` breakpoint = 1536px (Tailwind 默认)
  - `max-w-none` = 移除最大宽度限制

  **WHY Each Change**:
  - `2xl:max-w-none`: 在超大屏幕上移除宽度限制，实现全宽
  - `lg:col-span-4/8`: 给右侧预览区更多空间（从 58% 提升到 67%）

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  grep -n "2xl:max-w-none" components/SelfConsumption/index.tsx
  # Assert: 找到响应式断点设置

  grep -n "lg:col-span-4" components/SelfConsumption/index.tsx
  # Assert: 找到左栏新比例

  grep -n "lg:col-span-8" components/SelfConsumption/index.tsx
  # Assert: 找到右栏新比例

  grep -n 'data-testid="sc-container"' components/SelfConsumption/index.tsx
  # Assert: 找到 testid

  npm run build
  # Assert: Exit code 0
  ```

  **For Frontend/UI changes** (using playwright skill):
  ```
  # Agent executes via playwright browser automation:
  1. Start dev server: npm run dev (background)
  2. Navigate to: http://localhost:3000 (or configured port)
  3. Click navigation to enter self-consumption page
  4. Set viewport: { width: 1280, height: 800 }
  5. Measure: container with data-testid="sc-container" width
  6. Assert: width < 1280 (constrained by max-w-7xl)
  7. Screenshot: .sisyphus/evidence/layout-1280.png
  8. Set viewport: { width: 1920, height: 800 }
  9. Measure: same container width
  10. Assert: width > 1500 (full width minus sidebar)
  11. Screenshot: .sisyphus/evidence/layout-1920.png
  ```

  **Evidence to Capture:**
  - [ ] grep 命令输出
  - [ ] 两个视口宽度的截图对比

  **Commit**: NO (groups with Task 4)

---

- [x] 4. 验证并提交更改

  **What to do**:
  - 运行完整构建验证
  - 在开发服务器上进行视觉验证
  - 创建一个原子提交包含所有更改

  **Must NOT do**:
  - 不添加额外的修改
  - 不修改提交消息格式

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准验证和提交流程
  - **Skills**: [`git-master`, `playwright`]
    - `git-master`: 原子提交
    - `playwright`: 视觉验证

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Final
  - **Blocks**: None
  - **Blocked By**: Task 3

  **References**:
  - AGENTS.md - 项目的开发命令和规范

  **Acceptance Criteria**:

  ```bash
  # Final build verification
  npm run build
  # Assert: Exit code 0, no TypeScript errors

  # Lint check (if available)
  npm run lint 2>/dev/null || echo "No lint script"
  # Assert: No errors (or no lint script)
  ```

  **Evidence to Capture:**
  - [ ] build 输出
  - [ ] git diff summary
  - [ ] commit hash

  **Commit**: YES
  - Message: `refactor(layout): optimize responsive layout for consumption analysis page`
  - Files: 
    - `App.tsx`
    - `components/Dashboard.tsx`
    - `components/TimeConfig.tsx`
    - `components/Analysis.tsx`
    - `components/SelfConsumption/index.tsx`
  - Pre-commit: `npm run build`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 4 | `refactor(layout): optimize responsive layout for consumption analysis page` | App.tsx, Dashboard.tsx, TimeConfig.tsx, Analysis.tsx, SelfConsumption/index.tsx | npm run build |

---

## Success Criteria

### Verification Commands
```bash
# Build succeeds
npm run build  # Expected: Exit code 0

# Layout classes present
grep "2xl:max-w-none" components/SelfConsumption/index.tsx  # Expected: 1 match
grep "lg:col-span-4" components/SelfConsumption/index.tsx   # Expected: 1 match
grep "lg:col-span-8" components/SelfConsumption/index.tsx   # Expected: 1 match

# Orphan pages protected
grep "max-w-7xl" components/Dashboard.tsx    # Expected: 1+ match
grep "max-w-7xl" components/TimeConfig.tsx   # Expected: 1+ match
grep "max-w-7xl" components/Analysis.tsx     # Expected: 1+ match
```

### Final Checklist
- [x] All "Must Have" present
- [x] All "Must NOT Have" absent
- [x] Build passes without errors
- [x] 1280px viewport: content centered within max-w-7xl
- [x] 1920px viewport: content fills available width
- [x] Left column: 4/12 (33.3%)
- [x] Right column: 8/12 (66.7%)
