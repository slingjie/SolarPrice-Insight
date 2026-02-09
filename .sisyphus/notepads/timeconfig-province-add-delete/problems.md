# Problems - timeconfig-province-add-delete

- 2026-02-09: Hands-on Playwright scenarios (add/duplicate/delete) are blocked because the app never exits initialization (`初始化数据库中...`) under MCP browser automation. Captured evidence screenshots at `.sisyphus/evidence/task-timeconfig-*.png` show loading screen only.
- 2026-02-09: `npm run test` remains blocked by pre-existing failures in `services/pvgisService.test.ts` (4 failing cases) unrelated to TimeConfig changes.
- 2026-02-09: Updated `services/pvgisService.test.ts` so mocks match current `/seriescalc` hourly source, manual-angle optimal slope call, and PVcalc error flow; vitest run now succeeds.
