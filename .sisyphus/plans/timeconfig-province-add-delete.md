# 时段配置库省份新增/删除优化计划

## TL;DR

> **Quick Summary**: 让 `时段配置库` 页面支持稳定的“新增省份 + 删除省份”生命周期，省份列表从静态常量驱动改为以数据库配置为主的动态驱动，同时严格保持 `TimeConfigMatrix` 笔刷交互不变。  
>
> **Deliverables**:
> - `components/TimeConfig.tsx`：动态省份来源、可控新增、可控删除、选择态保护
> - `components/TimeConfig.test.tsx`：新增/删除核心交互测试
> - `components/TimeConfigMatrix.test.tsx`（必要时新增/补充）：笔刷行为非回归验证
>
> **Estimated Effort**: Medium  
> **Parallel Execution**: YES - 3 waves  
> **Critical Path**: Task 1 -> Task 2 -> Task 3 -> Task 5

---

## Context

### Original Request
在时段配置库页面，目前只支持现有省份配置，不支持新增和删除。要求先遍历程序，提供修改方案和计划，再执行；且笔刷配置方式不要改。

### Interview Summary
**Key Discussions**:
- 当前限制不是矩阵编辑能力不足，而是省份列表来源和生命周期管理不足。
- 用户明确要求“先方案/计划后执行”，并明确“笔刷方式不变”。
- 测试策略已确认：**自动化测试（Tests-after）**。

**Research Findings**:
- `components/TimeConfig.tsx` 省份列表来自 `PROVINCES` 静态常量，导致动态新增体验不稳定。
- `components/TimeConfigMatrix.tsx` 已支持任意 `selectedProvince` 的矩阵编辑与保存，不是瓶颈。
- `App.tsx` 中 `handleUpdateTimeConfigs` 是全量替换（remove + upsert），能承接新增/删除后的结果集。
- `components/admin/TimeConfigsManager.tsx` 已有管理端新增/删除，但本任务聚焦用户侧 `TimeConfigView`。

### Metis Review
**Identified Gaps** (addressed):
- 省份“空壳持久化”语义未定义 -> 采用默认：**仅持久化有配置的省份**（无独立省份表）。
- 省份命名与重复规则未定义 -> 采用默认：**trim 后判空；以 trim 后字符串做重复判断**。
- 删除行为细节未锁定 -> 采用默认：**确认弹窗后硬删除该省份全部配置**，不做撤销窗口。
- 可能范围蔓延到 Admin -> 明确排除：**不改 Admin 模块**。

---

## Work Objectives

### Core Objective
在不改变矩阵笔刷交互的前提下，让时段配置库页面具备稳定、可预期的省份新增与删除能力，并保证保存后的数据与列表一致。

### Concrete Deliverables
- `components/TimeConfig.tsx`
  - 省份列表改为动态来源（`configs` 派生）并保留预置省份作为推荐项
  - 新增省份输入/创建流程（包含空值与重复校验）
  - 删除省份流程（确认后删除该省份全部配置）
  - 删除当前选中省份后的安全回退选择逻辑
- `components/TimeConfig.test.tsx`
  - 覆盖新增省份、重复拦截、删除省份、删除后选择态
- `components/TimeConfigMatrix.test.tsx`（如无现成覆盖）
  - 覆盖笔刷交互核心行为不变（点击/拖拽赋值）

### Definition of Done
- [x] `TimeConfigView` 可新增任意非空、非重复省份，并进入矩阵编辑
- [x] 删除省份后，该省份配置从 `onSave` 提交结果中移除
- [x] 删除当前选中省份不会导致页面空指针或异常 UI 状态
- [x] `TimeConfigMatrix` 笔刷交互行为无功能变化
- [x] `npm run test` 通过
- [x] `npm run build` 通过

### Must Have
- 新增/删除能力在 `config` 视图可用（非 admin）
- 省份列表由实时配置数据驱动
- 输入校验明确：空白拦截、重复拦截
- 删除动作必须有确认

### Must NOT Have (Guardrails)
- 不改 `components/TimeConfigMatrix.tsx` 的笔刷交互模型（拖拽涂抹、全涂、同上月等）
- 不改 Admin 配置管理页面（`components/admin/TimeConfigsManager.tsx`）
- 不引入新数据库表/新 schema 迁移
- 不扩展为全站省份体系重构（仅限时段配置库页面）

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**  
> 全部验收都由执行代理完成，不依赖人工点击验证。

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Tests-after
- **Framework**: Vitest + Testing Library + jsdom

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

#### Scenario: Add new province from TimeConfig page
Tool: Playwright (playwright skill)
Preconditions: Dev server running at `http://localhost:3000`, app initialized
Steps:
1. Navigate to `http://localhost:3000/?view=config` or app route that opens “时段配置库”
2. Wait for placeholder `input[placeholder="搜索省份..."]`
3. Fill search input with `海南省`
4. Click button containing text `新增 "海南省"` (or new create button text after implementation)
5. Assert matrix header shows `海南省`
6. Click `保存配置`
7. Assert toast text contains `已保存 海南省 的配置`
8. Screenshot: `.sisyphus/evidence/task-timeconfig-add-hainan.png`
Expected Result: 新省份可创建、可编辑、可保存
Failure Indicators: 无新增入口、保存后未出现 toast、矩阵未切换
Evidence: `.sisyphus/evidence/task-timeconfig-add-hainan.png`

#### Scenario: Reject duplicate province add
Tool: Playwright (playwright skill)
Preconditions: `江苏省` 已存在
Steps:
1. Navigate to config page
2. Fill search input with `江苏省`
3. Trigger add action
4. Assert duplicate feedback visible（例如 toast/inline message: `省份已存在`）
5. Assert list count for `江苏省` 未增加重复项
6. Screenshot: `.sisyphus/evidence/task-timeconfig-duplicate-province.png`
Expected Result: 重复新增被拦截
Failure Indicators: 产生重复条目或覆盖异常
Evidence: `.sisyphus/evidence/task-timeconfig-duplicate-province.png`

#### Scenario: Delete selected province safely
Tool: Playwright (playwright skill)
Preconditions: 至少存在一个可删除省份配置
Steps:
1. Select province row with config indicator
2. Click delete/clear button in row
3. In confirm modal, click confirm (`清空`)
4. Assert deleted province configs no longer included in subsequent state (via UI list state)
5. Assert editor panel fallback text appears when deleted province was selected
6. Screenshot: `.sisyphus/evidence/task-timeconfig-delete-selected.png`
Expected Result: 删除生效且页面无异常状态
Failure Indicators: 删除后页面报错、仍显示旧配置
Evidence: `.sisyphus/evidence/task-timeconfig-delete-selected.png`

#### Scenario: Automated unit interaction checks
Tool: Bash (Vitest)
Preconditions: Dependencies installed
Steps:
1. Run `npx vitest run components/TimeConfig.test.tsx`
2. Assert exit code `0`
3. Run `npx vitest run components/TimeConfigMatrix.test.tsx` (if created/updated)
4. Assert exit code `0`
Expected Result: 交互测试与矩阵非回归测试通过
Failure Indicators: 测试失败、断言不稳定
Evidence: terminal output capture

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Start Immediately):
- Task 1: Baseline + dynamic province source design
- Task 4: Define/lock non-regression boundary for brush behavior

Wave 2 (After Wave 1):
- Task 2: Implement add province flow + validation
- Task 3: Implement delete flow + selection fallback

Wave 3 (After Wave 2):
- Task 5: Add/update tests and run verification commands

Critical Path: Task 1 -> Task 2 -> Task 3 -> Task 5  
Parallel Speedup: ~25-35% vs strict sequential

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 2, 3 | 4 |
| 2 | 1 | 5 | 3 |
| 3 | 1 | 5 | 2 |
| 4 | None | 5 | 1 |
| 5 | 2, 3, 4 | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|--------------------|
| 1 | 1, 4 | `task(category="quick", load_skills=["frontend-ui-ux"], run_in_background=false)` |
| 2 | 2, 3 | same profile, sequential per file to avoid merge conflicts |
| 3 | 5 | `task(category="quick", load_skills=["playwright"], run_in_background=false)` + Bash test/build |

---

## TODOs

- [x] 1. 重构 TimeConfig 省份来源为“动态为主 + 预置推荐”

  **What to do**:
  - 在 `TimeConfigView` 中新增 `configuredProvinces`（从 `configs` 去重派生）
  - 构建 `provinceOptions = union(configuredProvinces, PROVINCES)` 作为展示/推荐来源
  - 列表渲染从原始静态 `PROVINCES` 迁移到 `provinceOptions`

  **Must NOT do**:
  - 不修改 `TimeConfigMatrix` 任何笔刷交互逻辑
  - 不修改 DB schema

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单页面状态管理重构，复杂度低到中等
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 处理 UI 状态流与交互一致性
  - **Skills Evaluated but Omitted**:
    - `playwright`: 此任务不直接做浏览器自动化

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 4)
  - **Blocks**: 2, 3
  - **Blocked By**: None

  **References**:
  - `components/TimeConfig.tsx` - 当前省份列表与搜索逻辑实现位置
  - `constants.tsx` - `PROVINCES` 静态推荐来源
  - `docs/Global_Province_Selection_Memo.md` - 录入侧应使用动态来源 + 宽容输入模式
  - `types.ts:18` - `TimeConfig` 结构定义，province 字段约束

  **Acceptance Criteria**:
  - [ ] 省份列表不再仅依赖静态常量
  - [ ] 已保存的自定义省份可稳定出现在列表中
  - [ ] 预置省份仍可被搜索和选择

  **Agent-Executed QA Scenarios**:
  - Scenario: 配置派生省份显示
    - Tool: Vitest + Testing Library
    - Steps: render `TimeConfigView` with custom province configs -> assert custom province visible in list
    - Expected: custom province row exists
    - Evidence: test output log

  **Commit**: NO

---

- [x] 2. 新增省份创建流程（含输入校验和重复防御）

  **What to do**:
  - 复用现有搜索输入或补充明确新增按钮，支持新增省份进入编辑态
  - 输入归一化：`trim()` 后为空则拦截
  - 重复判定：对比现有省份（trim 后）重复则拦截并反馈
  - 创建成功后自动选中新省份并显示矩阵编辑区

  **Must NOT do**:
  - 不改变“新增后通过矩阵保存生成配置”的核心流

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 交互增强 + 小量校验逻辑
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 表单反馈和空态/错误态处理
  - **Skills Evaluated but Omitted**:
    - `playwright`: 放到整体验证任务

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: 5
  - **Blocked By**: 1

  **References**:
  - `components/TimeConfig.tsx:127` - 现有“新增 searchTerm”入口位置
  - `components/admin/TimeConfigsManager.tsx:174` - 管理端新建省份输入/确认交互可借鉴
  - `docs/Global_Province_Selection_Memo.md:5` - 录入/配置侧宽容输入原则

  **Acceptance Criteria**:
  - [ ] 输入空白字符不可创建
  - [ ] 已存在省份不可重复创建
  - [ ] 成功创建后自动进入该省份矩阵编辑态

  **Agent-Executed QA Scenarios**:
  - Scenario: 创建新省份成功
    - Tool: Playwright
    - Steps: 输入 `海南省` -> 点击新增 -> 断言矩阵标题为 `海南省`
    - Expected: 进入编辑态
    - Evidence: `.sisyphus/evidence/task-2-create-success.png`
  - Scenario: 重复新增失败
    - Tool: Playwright
    - Steps: 输入 `江苏省` -> 点击新增 -> 断言错误反馈
    - Expected: 不新增重复项
    - Evidence: `.sisyphus/evidence/task-2-create-duplicate.png`

  **Commit**: NO

---

- [x] 3. 删除省份流程与选中态安全回退

  **What to do**:
  - 保留确认弹窗删除流程
  - 删除后提交 `onSave(updatedList)`，确保该省份全部配置移除
  - 若删除的是当前 `selectedProvince`，执行安全回退：切换到 null 或下一个可选省份
  - 明确文案：删除语义是“删除该省份全部时段配置”

  **Must NOT do**:
  - 不引入“软删除省份注册表”
  - 不改 App 级持久化 contract

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 局部状态与删除路径健壮性增强
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 删除反馈与状态回退 UX
  - **Skills Evaluated but Omitted**:
    - `playwright`: 单独在验证阶段执行

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: 5
  - **Blocked By**: 1

  **References**:
  - `components/TimeConfig.tsx:43` - 当前删除实现 `clearProvinceConfig`
  - `App.tsx:169` - `handleUpdateTimeConfigs` 全量替换保存机制
  - `components/UI` ConfirmModal 模式（在 `TimeConfig.tsx` 已使用）

  **Acceptance Criteria**:
  - [ ] 删除确认后，目标省份配置从提交数组消失
  - [ ] 删除当前选中省份后，无异常渲染（显示空态或合理回退）
  - [ ] 删除非选中省份不影响当前编辑省份

  **Agent-Executed QA Scenarios**:
  - Scenario: 删除当前选中省份
    - Tool: Playwright
    - Steps: 选中目标省份 -> 点击删除 -> 确认 -> 断言编辑区回退空态
    - Expected: 无崩溃且省份配置已移除
    - Evidence: `.sisyphus/evidence/task-3-delete-selected.png`
  - Scenario: 删除其他省份不打断当前编辑
    - Tool: Playwright
    - Steps: 选中 A -> 删除 B -> 断言 A 仍保持编辑态
    - Expected: 当前编辑上下文稳定
    - Evidence: `.sisyphus/evidence/task-3-delete-other.png`

  **Commit**: YES
  - Message: `feat(timeconfig): support province add/delete lifecycle in config page`
  - Files: `components/TimeConfig.tsx`
  - Pre-commit: `npx vitest run components/TimeConfig.test.tsx`

---

- [x] 4. 矩阵笔刷交互非回归边界锁定

  **What to do**:
  - 仅做非回归保障，不改核心实现
  - 若缺少测试，补充 `TimeConfigMatrix` 最小非回归测试（点击涂抹、拖拽涂抹）
  - 验证保存按钮仍触发 `onSave` 预期路径

  **Must NOT do**:
  - 不修改 `handleCellClick` / `handleMouseEnter` / `isDragging` 的语义

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 主要是测试兜底
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 组件交互测试经验

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: 5
  - **Blocked By**: None

  **References**:
  - `components/TimeConfigMatrix.tsx:69` - 笔刷点击/拖拽逻辑
  - `utils/timeUtils.ts` - grid/rules 转换，不应被本任务改坏

  **Acceptance Criteria**:
  - [ ] 矩阵点击单元格可按 activeType 上色
  - [ ] 拖拽经过单元格可连续上色
  - [ ] 保存仍调用 `onSave(selectedProvince, newConfigs)`

  **Agent-Executed QA Scenarios**:
  - Scenario: 笔刷单击与拖拽
    - Tool: Vitest + Testing Library
    - Steps: render matrix -> mouseDown cell -> mouseEnter neighbor -> assert color/type changes
    - Expected: 涂抹行为与当前版本一致
    - Evidence: test log

  **Commit**: NO

---

- [x] 5. 端到端回归验证 + 构建校验

  **What to do**:
  - 新增/更新 `components/TimeConfig.test.tsx` 覆盖关键交互
  - 执行定向测试 + 全量测试 + build
  - 汇总证据文件与测试输出

  **Must NOT do**:
  - 不以“人工点过”为验收依据

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 测试与验证收口
  - **Skills**: [`playwright`, `frontend-ui-ux`]
    - `playwright`: 页面级自动验证与截图证据
    - `frontend-ui-ux`: 组件测试断言设计
  - **Skills Evaluated but Omitted**:
    - `git-master`: 非历史分析任务

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final)
  - **Blocks**: None
  - **Blocked By**: 2, 3, 4

  **References**:
  - `vitest.config.ts` - 测试环境配置
  - `setupTests.ts` - jest-dom 扩展
  - `components/PriceDatabase.test.tsx` - 组件测试风格参考
  - `hooks/useDatabase.test.ts` - RxDB mock 风格参考

  **Acceptance Criteria**:
  - [ ] `npx vitest run components/TimeConfig.test.tsx` 通过
  - [ ] `npx vitest run` 通过
  - [ ] `npm run build` 通过
  - [ ] Playwright 场景证据写入 `.sisyphus/evidence/`

  **Agent-Executed QA Scenarios**:
  - Scenario: 定向测试
    - Tool: Bash
    - Steps: `npx vitest run components/TimeConfig.test.tsx`
    - Expected: exit code 0
    - Evidence: terminal output capture
  - Scenario: 全量构建验证
    - Tool: Bash
    - Steps: `npm run build`
    - Expected: build success
    - Evidence: terminal output capture

  **Commit**: YES
  - Message: `test(timeconfig): add province lifecycle coverage and regression checks`
  - Files: `components/TimeConfig.test.tsx`, `components/TimeConfigMatrix.test.tsx`
  - Pre-commit: `npx vitest run && npm run build`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 3 | `feat(timeconfig): support province add/delete lifecycle in config page` | `components/TimeConfig.tsx` | `npx vitest run components/TimeConfig.test.tsx` |
| 5 | `test(timeconfig): add province lifecycle coverage and regression checks` | `components/TimeConfig.test.tsx`, `components/TimeConfigMatrix.test.tsx` | `npx vitest run && npm run build` |

---

## Success Criteria

### Verification Commands

```bash
npx vitest run components/TimeConfig.test.tsx
# Expected: pass

npx vitest run
# Expected: all tests pass

npm run build
# Expected: build success (exit code 0)
```

### Final Checklist
- [x] `TimeConfig` 页面可新增省份
- [x] `TimeConfig` 页面可删除省份（删除该省份全部配置）
- [x] 新增/删除后 UI 状态与数据一致
- [x] 笔刷交互方式保持不变
- [x] 自动化测试与构建全部通过
