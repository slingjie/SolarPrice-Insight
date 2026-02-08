# Draft: Work Schedule + Industry Profiles + TOU Rules

## Original Request (user)
- Update the "work schedule" configuration.
- Add default "user persona" (industry) configurations.
- Allow configuring TOU (time-of-use) rules for different time periods.
- User provided a reference idea: decouple load shape (24h shares, sum=1) from TOU slicing (peak/flat/valley).

## Candidate Direction (unconfirmed)
- Represent a persona primarily as a "typical day" 24-hour load share curve (24 numbers, normalized to 1).
- Keep TOU rules as separate configurable time segments; allow applying any TOU to any load shape.

## Repo Findings (current implementation)
- TOU library exists already: `TimeConfig` (province + `month_pattern` + `time_rules: TimeRule[]`), edited via 12x24 matrix UI.
- Tariffs snapshot TOU rules today: `TariffData.time_rules` is copied from a selected `TimeConfig` during SmartUpload/ManualEntry.
- Self-consumption 8760 engine uses `TimeConfig` (not `TariffData.time_rules`) to assign hourly `touType`, then prices with `TariffData.prices`.
- "工作作息配置" UI lives in `components/SelfConsumption/index.tsx`; schedule itself appears to be React state (not persisted). Holidays are persisted in RxDB.
- Current TOU varies by month but NOT by weekday/weekend; adding that likely requires extending `TimeConfig` model + resolver + matrix editor.

## Open Questions
- After adding weekday/weekend TOU, which modules must respect it besides the self-consumption aligned engine?
- Load input format for persona mode: keep current monthly-by-TOU excel only, or add simplified monthly-total (kWh) import/entry?

## Confirmed From User
- TOU rule switching dimension: distinguish weekday vs weekend.
- Industry persona curves: 1 typical-day curve + optional weekend override curve (if not set, weekend uses weekday curve).
- Default persona library size preference: more comprehensive (10+ industries).
- Proposed industry library list accepted.
- Load modeling decision: add "persona curve mode" as new default in Aligned Engine UI, keep existing ABCD mode as compatibility/advanced.
- Holiday TOU: eventually want a separate holiday rule set, but not in v1.
- v1 holiday mapping: treat holiday as weekend TOU.
- TOU weekday/weekend effect scope (v1): only SelfConsumption / aligned engine; other modules keep current behavior.
- Load input formats (v1): support BOTH existing monthly-by-TOU import and new simplified monthly-total (kWh) import.
- Industry personas: build a reusable persona library persisted in RxDB (defaults + user-defined CRUD).

## Proposed Default Industry Library (to confirm)
- manufacturing_general: 一般制造业（白班）
- manufacturing_2shift: 制造业（两班倒）
- manufacturing_3shift: 制造业（三班倒/24h）
- process_continuous: 连续型工业（化工/冶金/水泥）
- cold_chain: 冷链/仓储
- data_center: 数据中心
- hospital: 医院
- commercial_mall: 商业综合体/商场
- supermarket: 超市/便利店
- office: 办公楼/园区办公
- school: 学校
- hotel: 酒店
- restaurant: 餐饮（午晚高峰）
- ev_charging: 充电站/停车场充电
- water_wastewater: 自来水/污水处理

## Test Infrastructure (repo)
- Exists: YES
- Framework: Vitest + React Testing Library (jsdom)
- Commands: `npm test` (all), `npx vitest path/to/file.test.ts[x]` (single file)
- Example tests: `components/SelfConsumption/index.test.tsx`, `services/pvgisService.test.ts`

## Test Strategy Decision (confirmed)
- Automated tests: YES (tests-after)

## Open Questions
- What exactly does "work schedule config" mean in this app today (working days? shift hours? time segments?)
- Do personas need separate curves for workday vs weekend/holiday?
- Do TOU rules vary by season/month, weekday/weekend, or effective date ranges?
- Required default industries list and naming (CN/EN).

## Scope Boundaries (tentative)
- INCLUDE: data model + migration, UI for selecting persona and editing 24h shares, UI for defining TOU segments, persistence (RxDB).
- EXCLUDE: changing tariff calculation logic beyond consuming the new TOU+profile outputs (unless necessary for integration).

## Notes From User-Pasted Suggestion
- Output should be only 24-hour shares (sum=1), independent of TOU/price.
- Later steps can map monthly kWh -> daily -> hourly and slice by TOU.
