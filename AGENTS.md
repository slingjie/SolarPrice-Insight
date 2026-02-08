# SolarPrice Insight - AI Agent Guidelines

This document provides context and rules for AI agents (and human developers) working on the SolarPrice Insight codebase.

## 1. Project Overview
**SolarPrice Insight** is a React-based analysis tool for distributed photovoltaic (PV) pricing.
- **Core Philosophy**: Local-First (privacy-focused), AI-assisted (Gemini), Responsive.
- **Tech Stack**:
  - **Framework**: React 19 + TypeScript + Vite 6
  - **Styling**: Tailwind CSS
  - **Data**: RxDB (Local-First DB), Dexie, LocalStorage
  - **Charts**: Recharts, ECharts
  - **AI**: Google Generative AI (Gemini)

## 2. Development Commands

| Action | Command | Notes |
|--------|---------|-------|
| **Start Dev** | `npm run dev` | Runs on localhost:3000 (usually) |
| **Build** | `npm run build` | Outputs to `dist/` |
| **Test All** | `npm run test` | Runs Vitest |
| **Test Single** | `npx vitest -t "pattern"` | Match test name pattern |
| **Test File** | `npx vitest path/to/file` | Run tests in specific file |
| **UI Preview** | `npm run preview` | Preview production build |

## 3. Architecture & Patterns

### Directory Structure
- `/components`: UI Components.
  - `/Analysis`, `/Dashboard`, `/TimeConfig`: Feature-specific modules.
  - Shared components should be extracted if used in multiple views.
- `/services`: Business logic and external integrations.
  - `db.ts`: Database initialization and access (RxDB).
  - `gemini.ts` (implied): AI integration.
- `/constants.tsx`: Configuration constants, default data.
- `/types.ts`: Centralized TypeScript definitions.
- `/hooks`: Custom React hooks.

### State Management
- **Local State**: `useState` for UI transient state.
- **Persistent State**: **RxDB** is the source of truth for Tariffs and TimeConfigs.
  - Use `useEffect` to subscribe to DB changes (Observable pattern).
  - Do NOT rely solely on `localStorage` for core data; it is used for backups/migration.

## 4. Code Style & Conventions

### TypeScript
- **Strict Typing**: Avoid `any`. Define interfaces in `/types.ts` or co-located if private.
- **Props**: Use `interface` for component props (e.g., `interface DashboardProps { ... }`).
- **Null Safety**: Handle `null` and `undefined` explicitly, especially for DB queries.

### Components (React 19)
- **Functional Components**: Use `React.FC<Props>` or `function Component({ ... }: Props)`.
- **Hooks**: Place hooks at the top level. Custom hooks in `/hooks`.
- **Tailwind**: Use utility classes for styling.
  - Avoid inline `style={{ ... }}` unless dynamic values are required.
  - Use `className` with template literals for conditional styling: `` `p-4 ${isActive ? 'bg-blue-500' : ''}` ``.

### Imports
- Group imports:
  1. React / 3rd party libraries
  2. Components
  3. Services / Utils / Hooks
  4. Types / Constants
- Use absolute paths or clean relative paths.

### Error Handling
- **Async Operations**: Always wrap DB and API calls in `try/catch`.
- **UI Feedback**: Log errors to console `console.error('[Module] Error:', err)` and provide UI feedback (Toasts/Alerts) where appropriate.

## 5. Testing Guidelines
- **Unit Tests**: Test utility functions and complex logic (e.g., calculation engines).
- **Component Tests**: Use `@testing-library/react`.
  - Focus on user interactions (clicks, inputs).
  - Mock external services (Gemini, RxDB) when testing UI components.

## 6. Critical Rules for Agents
1. **No API Keys in Code**: Never hardcode API keys. Use `import.meta.env.VITE_GEMINI_API_KEY`.
2. **Database Integrity**: When modifying the DB schema, ensure migration logic exists (see `App.tsx` `initDB`).
3. **Local-First**: Remember data lives in the browser. Do not assume a backend server exists for data storage.
4. **Responsive Design**: Ensure UI components work on mobile and desktop (Tailwind `lg:`, `md:` prefixes).
5. **Preserve Comments**: Keep existing JSDoc/comments, especially for complex calculation logic.

## 7. Workflow
1. **Analyze**: Understand if the task is UI (Component), Logic (Service), or Data (DB).
2. **Plan**: Check `types.ts` for data structures.
3. **Implement**: Write code following the style above.
4. **Verify**: Run `npm run build` to check for TS errors. Run relevant tests.

## 8. Lessons Learned

### Excel 导入空行问题 (2026-02)

**问题**: 用户导入 Excel 后，数据库中出现大量字段为空的垃圾记录。

**根因**: SheetJS `sheet_to_json` 对"空行"的处理与直觉不同：

| 空行类型 | 表现 | `sheet_to_json` 行为 |
|---|---|---|
| 从未编辑过的行 | 真空行 | ✅ 自动跳过 |
| 编辑后按 Delete 清空的行 | 单元格存在但值为 `""` | ❌ 返回 `{ '省份': '', ... }` |
| 含空格/制表符的行 | 肉眼看是空的 | ❌ 返回 `{ '省份': '  ', ... }` |

用户在 Excel 中"删除内容" ≠ "删除单元格"。SheetJS 只要检测到单元格对象存在就会输出该行。

**教训**:
1. 任何外部数据源（Excel/CSV）导入后，必须在转换前做 required-field 校验，不能信任 `sheet_to_json` 会过滤空行。
2. 转换函数（如 `rowToTariff`）不应无条件生成 UUID 和默认值——这会让无效数据"看起来合法"。
3. 矩阵解析路径（`parseMatrixConfigs`）因为恰好校验了 `month` 范围而幸免，但这是偶然防御，不是设计。

**修复方式**: 在 `parseSpreadsheetFile` 的通用路径中添加 `isRowNonEmpty` + `rowValidators` 两层过滤，在 `rows.map(convert)` 之前拦截。

**相关文件**: `utils/dataImport.ts`, `utils/dataImport.test.ts`
