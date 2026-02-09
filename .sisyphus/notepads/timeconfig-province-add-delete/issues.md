# Issues - timeconfig-province-add-delete
- 2026-02-08: `lsp_diagnostics` reports missing React/@jsx-runtime declarations in the new test file because the repo lacks `@types/react`, which makes the diagnostics noisy even though the tests run.
- 2026-02-08: Scope creep caused Dashboard/App edits and an unused grid component during earlier verification; reverted them so only `components/TimeConfig.tsx` logic remains from this task.
- 2026-02-08: Cleanup complete; verified unrelated files reverted and only the intended `TimeConfig` logic remains tracked.
- 2026-02-09: Playwright browser session remains stuck on `初始化数据库中...` in this environment, preventing live UI interactions despite no console errors.
