# Issues

- 2026-02-07: Persona visibility gap stems from the mismatch between `last_modified` (written by `savePersona`) and the `_modified` sort order in `usePersonas`; if RxDB metadata does not jump ahead, new personas stay hidden.

- 2026-02-07: Personas list previously relied on `_modified` ordering and reactive subscribe without a failure fallback, leaving `loading` true when init errors occurred.
- 2026-02-07: Creating a new persona previously lacked any error path, so backend issues left the modal stuck and no message reached the user.
- 2026-02-07: Test coverages must continue to mock the `getDatabase` failure path, otherwise `usePersonas` init errors still drop stack traces while calling `console.error`.
