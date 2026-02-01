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
