# 消纳计算界面布局重构（B2：手风琴输入 + 常驻结果）

## TL;DR

> **Quick Summary**: 将 `SelfConsumption`（光伏消纳分析）页面重构为「左侧手风琴输入（4块）+ 右侧结果常驻」的 B2 布局，提升桌面端配置/查看效率；同时修复双滚动与小屏表单拥挤问题，并在改完后补充 Vitest 组件测试 + Playwright 自动化界面验证。
>
> **Deliverables**:
> - B2 布局 + 手风琴输入（4区块）+ 折叠态摘要标签 + 空状态引导
> - 结果区保持现有 KPI/图表/导出能力（仅调整容器与空态）
> - 修复/规避嵌套滚动（仅保留单一滚动容器）
> - 响应式适配：<lg 单列可用；表单 grid 在小屏不挤
> - 改完后补：Vitest + Testing Library 关键交互测试
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves（UI重构 / 测试与验证）
> **Critical Path**: 布局骨架与拆分 → 手风琴与空态 → 滚动/响应式修复 → 测试与自动化验证

---

## Context

### Original Request
重构消纳计算界面的布局，请给出几个方案，我们来讨论。

### Interview Summary
**Key Decisions**:
- **目标**: 提高桌面端操作效率
- **方案**: B2（左侧手风琴输入 + 右侧结果常驻）
- **分组**: 4块独立区（项目/负荷/电价/光伏）
- **侧边栏**: 保留 `AnalysisSidebar`
- **手风琴**: 多开模式 + 折叠态显示 1 行摘要标签
- **结果空态**: 引导图 + 操作提示
- **移动端**: 自动响应式（<lg 变单列/自适应）
- **测试策略**: 测试后补（Vitest + Testing Library）

### Research Findings
- 当前页面实现集中在 `components/SelfConsumption/index.tsx`（约 1041 行，布局/逻辑/UI 混在一起）
- 现有布局已是左右分栏，但左侧为卡片堆叠，右侧在无结果时展示“负荷数据预览”表格
- 当前存在潜在双滚动：`App.tsx` 的 `<main>` 与 `SelfConsumption` 内部 `<main>` 都在滚动

### Metis Review
- 已尝试调用 Metis 做 gap analysis，但工具返回空输出（无可用反馈）。本计划通过“自检清单 + 明确 guardrails + 自动化验收”补齐。

---

## Work Objectives

### Core Objective
在不改动计算/数据逻辑的前提下，重构 `SelfConsumption` 页面布局为更高效的桌面端信息架构（输入更可控、结果更常驻），并改善滚动与小屏可用性。

### Scope
- IN:
  - `SelfConsumption` 页面布局/交互重构（手风琴、空态、响应式、滚动）
  - 必要的组件拆分（提升可维护性，降低 JSX 嵌套）
  - 测试后补：新增少量 UI 交互测试
- OUT:
  - 任何计算引擎/财务计算/导出语义变更（services/*、结果字段含义不变）
  - 数据库 schema、存储结构、导入导出格式变更
  - 引入新的 UI 组件库（保持现有 Tailwind + Lucide 体系）

### Definition of Done
- [x] `npm run test` → PASS
- [x] `npm run build` → PASS
- [x] Playwright 自动化验证：桌面视口与移动视口下页面可用（无横向溢出、手风琴可展开/折叠、空态引导出现）
- [x] 手风琴输入区：4区块齐全、可多开、标题行显示摘要标签
- [x] 结果区：无结果时显示引导；有结果时 KPI/图表/导出与当前一致
- [x] 单一滚动容器：避免“主页面 + 内部 main”双滚动体验

### Must Have
- 保留 `components/SelfConsumption/AnalysisSidebar.tsx` 的固定侧栏模式
- 左侧输入区改为 4 块手风琴（项目/负荷/电价/光伏），支持多开
- 每块折叠态显示 1 行摘要标签（提升“扫描/确认配置”效率）
- 结果区空态改为引导（而非默认展示大表格）
- <lg 自动变为单列，且表单在小屏不挤（`grid-cols-2` → `grid-cols-1 sm:grid-cols-2`）

### Must NOT Have (Guardrails)
- ❌ 不修改计算逻辑与结果定义：`services/*` 不应因布局重构而改语义
- ❌ 不删除现有能力：上传、识别省份、节假日管理、导出、KPI、图表都必须保留
- ❌ 不引入新依赖（除非绝对必要且能自证收益）
- ❌ 不把页面改成多步向导（Wizard）流程

---

## Verification Strategy (Tests-after)

### Test Decision
- **Infrastructure exists**: YES
  - `vitest.config.ts`（jsdom + `setupTests.ts`）
  - 组件测试示例：`components/PriceDatabase.test.tsx`
- **User wants tests**: YES（tests-after）
- **Framework**: Vitest + Testing Library

### Automated Verification (Agent-executable)

**Commands**:
- `npm run test`（Vitest）
- `npm run build`（Vite build）

**Playwright (推荐用于 UI 验证)**:
- 启动开发服务器：`npm run dev`（端口见 `vite.config.ts:8-23`，当前为 4000）
- 自动化步骤（示例）：
  - 访问 `http://localhost:4000`
  - 点击进入“光伏消纳分析/自发自用分析”入口
  - 验证手风琴标题可点击展开/折叠（多开）
  - 验证无结果时右侧显示引导区
  - 截图保存到 `.sisyphus/evidence/`（桌面 + 移动两套）

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (UI重构):
├── Task 1: 基线校验 + 定位改动点
├── Task 2: 建立 B2 布局骨架（左手风琴/右结果常驻）
├── Task 3: 4区块手风琴 + 摘要标签 +（默认）全展开/全收起
├── Task 4: 结果区空态引导（保留预览能力为次级入口）
├── Task 5: 响应式与表单 grid 修复
└── Task 6: 滚动体验修复（消除双滚动）

Wave 2 (测试与验证):
├── Task 7: Vitest 组件测试（手风琴/空态）
└── Task 8: Playwright 自动化回归 + build/test 全通过

Critical Path: 2 → 3 → 4 → 5/6 → 7 → 8
```

---

## TODOs

> 说明：此计划面向执行代理（Sisyphus）。每个任务包含可自动执行的验收步骤，避免“用户手动确认”。

- [x] 1. 基线校验 + 确认当前页面结构

  **What to do**:
  - 阅读并标注现有布局锚点：输入区、结果区、空态、侧边栏偏移、滚动容器
  - 运行一次基线验证命令，确保当前分支状态可通过（用于后续对比）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 只做定位与基线检查
  - **Skills**: `playwright`
    - `playwright`: 可顺手截取“改前”桌面/移动截图，便于回归

  **References**:
  - `components/SelfConsumption/index.tsx:430-1040` - 主页面 JSX 与左右分栏
  - `components/SelfConsumption/index.tsx:810-1028` - 结果区（含空态预览表与有结果时的 KPI/图表/导出）
  - `components/SelfConsumption/AnalysisSidebar.tsx:10-64` - 固定侧栏宽度与内容
  - `App.tsx:197-283` - self-consumption 视图渲染与外层滚动容器
  - `vite.config.ts:8-23` - dev server 端口（4000）

  **Acceptance Criteria**:
  - [ ] `npm run test` → PASS
  - [ ] `npm run build` → PASS
  - [ ] （可选）Playwright 截图：
    - `.sisyphus/evidence/sc-before-desktop.png`
    - `.sisyphus/evidence/sc-before-mobile.png`

- [x] 2. 建立 B2 布局骨架（左输入 / 右结果常驻）

  **What to do**:
  - 保持 `AnalysisSidebar`（fixed）不变
  - 保持当前左右分栏比例（`lg:col-span-4` / `lg:col-span-8`），将“左侧输入”改造为手风琴容器的承载位
  - 为后续测试与自动化验证添加稳定选择器（例如保留/扩展 `data-testid`，避免仅靠文本定位）
    - 默认建议：给 `SelfConsumption` 内层 `<main>` 增加 `data-testid="sc-main"`（供 Task 6 验证滚动容器）

  **Must NOT do**:
  - 不改任何计算/导出逻辑，只重排布局与容器

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`

  **References**:
  - `components/SelfConsumption/index.tsx:446-450` - 当前左右分栏 grid
  - `components/SelfConsumption/index.tsx:451-807` - 左列输入（4块）
  - `components/SelfConsumption/index.tsx:810-1028` - 右列结果

  **Acceptance Criteria**:
  - [ ] 桌面视口（>= lg）：左输入/右结果并列存在
  - [ ] < lg：自动变单列，页面无横向滚动条
  - [ ] `npm run build` → PASS

- [x] 3. 4区块手风琴 + 折叠态摘要标签（多开）

  **What to do**:
  - 将以下 4 个输入块改造成手风琴区块（多开）：
    - 项目基础信息
    - 负荷数据
    - 电价配置
    - 光伏系统参数
  - 每个区块标题行展示“摘要标签”（1 行、可换行但不抢主视觉）
  - 默认行为（可按实现调整）：
    - 多开模式
    - 初始展开：优先展开“未完成/缺失输入”的区块
  - **默认加一个桌面端效率开关**（如“全展开 / 全收起”）放在输入区顶部；若实现复杂可降级为不做

  **Suggested Summary Tags (defaults,可调整)**:
  - 项目：省份（或“未选择”）
  - 负荷：已导入 N 个月 / 未上传；作息模式（双休/单休/无休）
  - 电价：分类 + 电压等级；上网电价
  - 光伏：装机 kWp；来源（PVGIS/导入发电表）

  **References**:
  - `components/SelfConsumption/index.tsx:451-493` - 项目基础信息块
  - `components/SelfConsumption/index.tsx:496-607` - 负荷数据块
  - `components/SelfConsumption/index.tsx:609-656` - 电价配置块
  - `components/SelfConsumption/index.tsx:658-807` - 光伏系统参数块

  **Acceptance Criteria (Playwright)**:
  - [ ] 进入页面后，能展开/折叠任意区块；并且可同时展开多个
  - [ ] 折叠态标题行能看到摘要标签（至少 2 个区块可见）
  - [ ] 点击“编辑节假日库”可打开弹窗（验证手风琴内交互未被破坏）
  - [ ] 截图：`.sisyphus/evidence/sc-accordion-desktop.png`

- [x] 4. 结果区空态改为“引导图 + 操作提示”（预览作为次级入口）

  **What to do**:
  - 当 `!results` 时，右侧不再默认展示大表格预览（当前在 `components/SelfConsumption/index.tsx:812-860`）
  - 改为“引导卡”：
    - 3-5 步 checklist（例如：上传负荷 → 选择电价 → 配置光伏 → 开始分析）
    - 根据当前缺失条件动态提示（可复用现有校验逻辑，如 `validateInputs()`）
  - **为了桌面效率（默认）**：当已上传负荷数据时，提供一个“查看负荷预览”次级入口（可折叠/弹出），避免完全丢失预览能力

  **References**:
  - `components/SelfConsumption/index.tsx:812-860` - 当前空态预览表
  - `components/SelfConsumption/index.tsx:862-1028` - 有结果时的结果区

  **Acceptance Criteria (Playwright)**:
  - [ ] 无结果时右侧显示引导区（非“负荷数据预览”大表格为默认首屏）
  - [ ] （当有负荷数据时）仍能触达预览能力（次级入口）
  - [ ] 截图：`.sisyphus/evidence/sc-empty-state-desktop.png`

- [x] 5. 响应式与表单 grid 修复（小屏不挤）

  **What to do**:
  - 将关键表单网格从固定 `grid-cols-2` 调整为 `grid-cols-1 sm:grid-cols-2`（或等效策略）
  - 确保小屏下：输入区块内字段不互相挤压，按钮/下拉不溢出

  **References**:
  - `components/SelfConsumption/index.tsx:526` - 作息配置 grid
  - `components/SelfConsumption/index.tsx:616` - 电价配置 grid
  - `components/SelfConsumption/index.tsx:682` - 光伏参数 grid

  **Acceptance Criteria (Playwright)**:
  - [ ] 视口 390x844 下无横向滚动（`document.documentElement.scrollWidth <= window.innerWidth + 1`）
  - [ ] 截图：`.sisyphus/evidence/sc-mobile.png`

- [x] 6. 滚动体验修复：消除双滚动（只留一个滚动容器）

  **What to do**:
  - 解决当前潜在双滚动：
    - 外层：`App.tsx:203` 的 `<main ... overflow-y-auto>`
    - 内层：`components/SelfConsumption/index.tsx:434` 的 `<main ... overflow-y-auto h-screen>`
  - 推荐策略（默认）：移除/弱化 `SelfConsumption` 内层 `overflow-y-auto h-screen`，让滚动由外层 `<main>` 统一承载
  - 验证侧边栏 fixed 与主内容滚动行为正常

  **References**:
  - `App.tsx:203-283` - 外层 main
  - `components/SelfConsumption/index.tsx:431-435` - 内层 main

  **Acceptance Criteria**:
  - [ ] Playwright 验证：`[data-testid="sc-main"]` 的 `overflow-y` 不是 `auto/scroll`（只保留外层滚动）
  - [ ] `npm run build` → PASS

- [x] 7. 测试后补：Vitest 组件测试（手风琴/空态）

  **What to do**:
  - 新增/补充组件测试，覆盖最关键的“结构与交互”而非像素级布局：
    - 手风琴：点击标题展开/折叠，多开模式可并存
    - 空态：无结果时引导区出现；不再默认渲染大表格预览
  - 尽量让测试避开复杂业务依赖（可针对拆出来的 UI 子组件测）

  **References**:
  - `vitest.config.ts:5-12` - Vitest 配置
  - `setupTests.ts:1` - jest-dom setup
  - `components/PriceDatabase.test.tsx:1-133` - Testing Library 测试风格参考

  **Acceptance Criteria**:
  - [ ] 新增测试文件（例如：`components/SelfConsumption/*.test.tsx`）
  - [ ] `npm run test` → PASS

- [x] 8. 自动化回归：Playwright smoke + build/test 全通过

  **What to do**:
  - 用 Playwright 做 2 个视口的 smoke 回归：桌面 + 移动
  - 核对关键路径：进入页面 → 展开/折叠 → 空态引导 →（可选）查看预览入口

  **Acceptance Criteria**:
  - [ ] `npm run test` → PASS
  - [ ] `npm run build` → PASS
  - [ ] 产出证据截图：
    - `.sisyphus/evidence/sc-accordion-desktop.png`
    - `.sisyphus/evidence/sc-empty-state-desktop.png`
    - `.sisyphus/evidence/sc-mobile.png`

---

## Defaults Applied (override if needed)

- 空态引导为首屏，但提供“查看负荷预览”的次级入口（兼顾桌面效率与引导）
- 摘要标签字段集合按任务 3 的 Suggested Summary Tags 执行
- 手风琴初始展开优先“未完成/缺失输入”的区块
- 滚动修复采用“移除内层 main 的滚动”策略（以外层 App main 为唯一滚动）

---

## Notes / Risks

- `components/SelfConsumption/index.tsx` 超大文件：建议小步拆分（先骨架、再替换每个区块），每步都跑 `npm run build`
- 固定侧边栏与滚动容器的组合容易引入“内容被遮挡/双滚动”：需要用 Playwright 在不同视口验证
