# Fix Persona Create Visibility Failure

## TL;DR

> **Quick Summary**: 修复 SelfConsumption 的行业画像“新建后不可见/看起来新建失败”问题。核心路径是修正 `usePersonas` 的错误排序字段并补齐失败态处理，再增加回归测试防止复发。
>
> **Deliverables**:
> - 修复画像查询排序字段与加载失败兜底
> - 修复新建画像错误提示缺失
> - 新增针对该缺陷的自动化回归测试（Tests-after）
>
> **Estimated Effort**: Short
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 -> Task 2 -> Task 4

---

## Context

### Original Request
光伏消纳分析模块中“管理用户画像”无法新建用户画像，请提供修复方案和修复计划。

### Interview Summary
**Key Discussions**:
- 用户目标是“可落地修复方案 + 可执行计划”，不是重构画像模块。
- 自动化测试策略已确认：**Tests-after**。

**Research Findings**:
- `usePersonas` 使用 `sort: [{ _modified: 'desc' }]`，但 persona schema 并没有 `_modified` 字段。
- persona schema 明确包含并要求 `last_modified`。
- 新建画像走 `savePersona -> db.personas.upsert`，写入路径存在；更可能是“读/订阅异常导致 UI 不刷新”。
- `usePersonas` 的 `loading` 只在订阅回调里置为 `false`，异常路径可能造成界面长期“加载中”。
- `createNewPersona` 缺少 `try/catch`，写入失败时缺乏用户可见错误。

### Metis Review
**Identified Gaps (addressed)**:
- 缺少“排序字段应基于哪一个时间字段”的决策：默认采用 `last_modified`（与 schema/业务字段一致）。
- 缺少“失败态可观测性”：补充 hook 初始化失败兜底 + create 流程显式错误反馈。
- 缺少“范围边界”：本次只修 persona 创建故障链路，不做跨模块大范围 `_modified` 整治。

---

## Work Objectives

### Core Objective
确保“管理画像库”中新建画像后可立即可见且可继续编辑；当读写失败时提供明确错误提示并可恢复。

### Concrete Deliverables
- 更新 `hooks/useDatabase.ts` 中 `usePersonas` 查询与异常路径处理。
- 更新 `components/SelfConsumption/PersonaManager.tsx` 中 `createNewPersona` 错误处理。
- 新增/更新 persona 相关测试文件，覆盖成功路径与失败路径。

### Definition of Done
- [x] 在开发环境中执行新建画像流程，列表立即出现新项，且选中状态正确。
- [x] 当 persona 查询初始化失败时，不会永久卡在 loading。
- [x] 当新建写入失败时，界面显示可见错误信息。
- [x] `npm run test` 与 `npm run build` 均通过。

### Must Have
- 修复字段不匹配导致的 persona 查询异常风险。
- 保持现有业务数据结构与 UI 交互习惯不变。
- 为本缺陷补回归测试。

### Must NOT Have (Guardrails)
- 不修改 persona schema 版本与迁移策略（除非测试证明必须）。
- 不顺带重构 SelfConsumption 其他业务逻辑。
- 不扩大到全项目 `_modified` 全量替换（可作为后续独立任务）。

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
>
> **FORBIDDEN**:
> - "User manually tests..."
> - "User visually confirms..."
> - "Ask user to verify..."

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Tests-after
- **Framework**: Vitest (+ React Testing Library)

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| Frontend/UI | Playwright | Open page, click 管理画像库, create persona, assert list/selection/error |
| Unit/Hook | Bash (vitest) | Run targeted tests, assert pass/fail counts |
| Integration smoke | Bash | Run full test + build |

---

## Execution Strategy

### Parallel Execution Waves

```text
Wave 1 (Start Immediately):
├── Task 1: Baseline + failure reproduction checkpoints
└── Task 2: Fix usePersonas query/sort/loading fallback

Wave 2 (After Wave 1):
├── Task 3: Fix PersonaManager create error handling
└── Task 4: Add regression tests + run verification commands

Critical Path: Task 1 -> Task 2 -> Task 4
Parallel Speedup: ~25% vs fully sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2,4 | 2 |
| 2 | 1 | 4 | 1 |
| 3 | 2 | 4 | None |
| 4 | 2,3 | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1,2 | `delegate_task(category="quick", load_skills=["playwright"], run_in_background=false)` |
| 2 | 3,4 | `delegate_task(category="quick", load_skills=["playwright","git-master"], run_in_background=false)` |

---

## TODOs

- [x] 1. 建立缺陷基线与验证锚点

  **What to do**:
  - 明确当前失败链路：PersonaManager 新建按钮 -> `createNewPersona` -> `savePersona` -> `usePersonas` 订阅刷新。
  - 固化回归前行为：记录查询字段、loading 状态切换点、错误提示现状。
  - 形成后续测试断言所需的“失败前预期”。

  **Must NOT do**:
  - 不改代码。
  - 不引入新依赖。

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 定位单缺陷、低耦合、短流程。
  - **Skills**: [`playwright`]
    - `playwright`: 用于后续 UI 流程可执行验证脚本化。
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: 本任务不涉及视觉改版。

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: 2, 4
  - **Blocked By**: None

  **References**:
  - `components/SelfConsumption/PersonaManager.tsx` - 新建入口与错误提示行为基线。
  - `services/personaService.ts` - 新建写入路径（upsert）基线。
  - `hooks/useDatabase.ts` - persona 列表查询/订阅/loading 基线。
  - `services/db.ts` - persona schema 字段权威定义。

  **Acceptance Criteria**:
  - [x] 缺陷链路文档化并可映射到上述 4 个文件。
  - [x] 明确标注 `_modified` 与 `last_modified` 的不一致点。

  **Agent-Executed QA Scenarios**:

  ```text
  Scenario: Baseline creation flow mapping completed
    Tool: Bash
    Preconditions: Repository checked out
    Steps:
      1. Extract references from the four target files
      2. Confirm create path and read path are both identified
      3. Confirm mismatch field is explicitly documented
    Expected Result: Baseline notes identify exact breakpoints
    Failure Indicators: Missing mismatch evidence or incomplete flow mapping
    Evidence: .sisyphus/evidence/task-1-baseline-notes.txt
  ```

  **Commit**: NO

- [x] 2. 修复 `usePersonas` 查询字段与 loading 失败兜底

  **What to do**:
  - 将 persona 查询排序字段改为 schema 合法字段（`last_modified`）。
  - 为 `init`/订阅初始化增加异常处理，确保失败路径也会结束 loading 并保留可见错误日志。
  - 保持 hook 返回结构兼容（`{ personas, loading }` 不破坏调用方）。

  **Must NOT do**:
  - 不更改 persona 数据结构。
  - 不新增破坏性 API。

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单 hook 小范围修复。
  - **Skills**: [`playwright`]
    - `playwright`: 后续验证“列表不再卡 loading”。
  - **Skills Evaluated but Omitted**:
    - `git-master`: 当前步骤不涉及版本历史操作。

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: 3, 4
  - **Blocked By**: 1

  **References**:
  - `hooks/useDatabase.ts` - 目标修复点。
  - `services/db.ts` - `last_modified` 是 persona 合法字段。
  - `types.ts` - `LoadPersona` 类型契约。
  - `components/SelfConsumption/index.tsx` - hook 消费端依赖 `loading/personas`。

  **Acceptance Criteria**:
  - [x] persona 查询不再使用 `_modified`。
  - [x] 查询初始化失败时，`loading` 可退出（不永久卡死）。
  - [x] 现有调用方无需改动即可编译通过。

  **Agent-Executed QA Scenarios**:

  ```text
  Scenario: Persona hook exits loading on successful query
    Tool: Bash (vitest)
    Preconditions: Test file includes mocked getDatabase success path
    Steps:
      1. Run: npx vitest -t "usePersonas success"
      2. Assert: test passes and loading transitions to false
    Expected Result: Hook emits persona list and loading=false
    Failure Indicators: test timeout or loading remains true
    Evidence: .sisyphus/evidence/task-2-hook-success.txt

  Scenario: Persona hook exits loading on query failure
    Tool: Bash (vitest)
    Preconditions: Test file includes mocked getDatabase/query throw
    Steps:
      1. Run: npx vitest -t "usePersonas failure fallback"
      2. Assert: test passes and loading transitions to false with empty personas
    Expected Result: No stuck loading state after failure
    Failure Indicators: loading never ends or unhandled rejection
    Evidence: .sisyphus/evidence/task-2-hook-failure.txt
  ```

  **Commit**: YES
  - Message: `fix(persona): use valid sort field in persona hook`
  - Files: `hooks/useDatabase.ts`
  - Pre-commit: `npx vitest -t "usePersonas"`

- [x] 3. 修复 PersonaManager 新建失败可观测性

  **What to do**:
  - 在 `createNewPersona` 增加 `try/catch`。
  - 失败时设置用户可见错误（复用现有 `error` 区域），并保留上下文日志。
  - 成功时维持当前行为：自动选中新建画像。

  **Must NOT do**:
  - 不改变“新建默认画像数据”业务规则。
  - 不改动删除/保存流程语义。

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单组件局部增强。
  - **Skills**: [`playwright`]
    - `playwright`: 覆盖 UI 创建成功/失败提示路径。
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: 不做视觉样式重构。

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 2)
  - **Blocks**: 4
  - **Blocked By**: 2

  **References**:
  - `components/SelfConsumption/PersonaManager.tsx` - 新建入口与错误展示区域。
  - `services/personaService.ts` - 写入失败来源与异常冒泡点。
  - `components/SelfConsumption/index.tsx` - 选中 persona 的上层状态联动。

  **Acceptance Criteria**:
  - [x] 新建失败时出现清晰错误提示。
  - [x] 新建成功时自动选中新 persona。
  - [x] 无未处理 Promise rejection。

  **Agent-Executed QA Scenarios**:

  ```text
  Scenario: Successful create shows newly selected persona
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on http://localhost:3000, SelfConsumption page reachable
    Steps:
      1. Navigate to SelfConsumption page
      2. Click button:has-text("管理画像库")
      3. Click button:has-text("新建")
      4. Wait for list item containing text "自定义画像" (timeout: 5s)
      5. Assert newly created list item has active style state
      6. Screenshot: .sisyphus/evidence/task-3-create-success.png
    Expected Result: New persona appears and becomes active
    Failure Indicators: No new item appears, selection unchanged, or modal error shown
    Evidence: .sisyphus/evidence/task-3-create-success.png

  Scenario: Create failure surfaces visible error
    Tool: Bash (vitest)
    Preconditions: PersonaManager test mocks savePersona rejection
    Steps:
      1. Run: npx vitest -t "PersonaManager create failure"
      2. Assert: error text rendered (e.g., 保存失败/新建失败)
    Expected Result: User-visible error is shown on rejection
    Failure Indicators: rejection swallowed without UI feedback
    Evidence: .sisyphus/evidence/task-3-create-failure.txt
  ```

  **Commit**: YES
  - Message: `fix(persona): surface create errors in persona manager`
  - Files: `components/SelfConsumption/PersonaManager.tsx`
  - Pre-commit: `npx vitest -t "PersonaManager create"`

- [x] 4. 补齐回归测试并完成端到端验证

  **What to do**:
  - 新增或更新测试覆盖：
    - `usePersonas` 排序字段与失败兜底。
    - PersonaManager 新建成功与失败反馈。
  - 执行整体验证：目标测试、全量测试、构建。

  **Must NOT do**:
  - 不引入与缺陷无关的大规模快照更新。
  - 不忽略 flaky 测试（需定位并稳定）。

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 验证驱动收口。
  - **Skills**: [`playwright`, `git-master`]
    - `playwright`: UI 流程端到端验证。
    - `git-master`: 规范提交拆分与提交消息。
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: 非视觉任务。

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Final (Wave 2)
  - **Blocks**: None
  - **Blocked By**: 2, 3

  **References**:
  - `package.json` - 验证命令入口（`npm run test`, `npm run build`）。
  - `components/SelfConsumption/index.test.tsx` - 自消费模块测试组织风格参考。
  - `components/SelfConsumption/PersonaManager.tsx` - 行为断言来源。
  - `hooks/useDatabase.ts` - hook 行为断言来源。

  **Acceptance Criteria**:
  - [x] `npx vitest -t "usePersonas"` 通过。
  - [x] `npx vitest -t "PersonaManager"` 通过。
  - [x] `npm run test` 全量通过。
  - [x] `npm run build` 通过。

  **Agent-Executed QA Scenarios**:

  ```text
  Scenario: Full regression passes
    Tool: Bash
    Preconditions: Dependencies installed
    Steps:
      1. Run: npx vitest -t "usePersonas"
      2. Run: npx vitest -t "PersonaManager"
      3. Run: npm run test
      4. Run: npm run build
    Expected Result: All commands exit code 0
    Failure Indicators: Any non-zero exit, TS error, or failing assertions
    Evidence: .sisyphus/evidence/task-4-regression.txt

  Scenario: UI create flow remains healthy after tests
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running and app bootstrapped
    Steps:
      1. Open SelfConsumption page
      2. Enter PersonaManager and create one persona
      3. Close/reopen PersonaManager
      4. Assert created persona still exists in list
      5. Screenshot: .sisyphus/evidence/task-4-ui-persistence.png
    Expected Result: Created persona persists and is visible after reopen
    Failure Indicators: Persona missing or manager stuck in loading
    Evidence: .sisyphus/evidence/task-4-ui-persistence.png
  ```

  **Commit**: YES
  - Message: `test(persona): add regression coverage for persona create flow`
  - Files: `hooks/useDatabase.*`, `components/SelfConsumption/PersonaManager.*`
  - Pre-commit: `npm run test && npm run build`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 2 | `fix(persona): use valid sort field in persona hook` | `hooks/useDatabase.ts` | `npx vitest -t "usePersonas"` |
| 3 | `fix(persona): surface create errors in persona manager` | `components/SelfConsumption/PersonaManager.tsx` | `npx vitest -t "PersonaManager create"` |
| 4 | `test(persona): add regression coverage for persona create flow` | persona hook/manager tests | `npm run test && npm run build` |

---

## Success Criteria

### Verification Commands
```bash
npx vitest -t "usePersonas"
# Expected: pass

npx vitest -t "PersonaManager"
# Expected: pass

npm run test
# Expected: pass

npm run build
# Expected: pass
```

### Final Checklist
- [x] 新建 persona 后立即可见并被选中
- [x] Persona 列表不再因查询异常卡 loading
- [x] 新建失败有明确 UI 错误提示
- [x] 自动化测试与构建全部通过
