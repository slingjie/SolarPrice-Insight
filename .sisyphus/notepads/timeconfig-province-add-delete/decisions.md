# Decisions - timeconfig-province-add-delete
- 2026-02-08: Keep `PROVINCES` as the base order and append additional configured provinces sorted via `localeCompare('zh-Hans-CN')` for deterministic UI/test output.
- 2026-02-08: Keep the search filter as an `includes` check on the derived list so custom provinces added via configs or search remain selectable without extra overrides.
- 2026-02-08: Created `normalizeProvinceLabel` plus derived normalization list so the create affordance only appears for trim-unique provinces and the input is reset/selected when a new name passes validation.
- 2026-02-08: Chose to clear the `selectedProvince` state whenever the active province is deleted so the matrix view never stays bound to a nonexistent config set.
