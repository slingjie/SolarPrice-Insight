# Decisions

- 2026-02-07: Decision to treat this task as investigation/evidence only and leave schema/ordering fixes for subsequent implementation (Task 2) to avoid modifying production sources.

- 2026-02-07: Decided to keep the existing return contract while switching to `last_modified` and making loading resilient so we avoid API churn.
- 2026-02-07: Chose to reuse the existing modal error UI while logging the failure so we don’t introduce a new architecture for create failures.
- 2026-02-07: Decided to add targeted vitest coverage for both hook initialization paths and PersonaManager create flows instead of touching production code again.
- 2026-02-07: Marked the persona-create-fix plan checkboxes for baseline, hook, create, regression, and final verification as complete to signal readiness for follow-up implementation.
