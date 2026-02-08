# Learnings

- 2026-02-07: Persona creation (PersonaManager → savePersona) populates `last_modified` but the consumer hook (`usePersonas`) still sorts by RxDB `_modified`, so newly created personas can disappear even though business metadata exists.

- 2026-02-07: Hook now sorts personas by `last_modified` and guards its init with try/catch so the UI stops loading even if the DB subscription setup fails.
- 2026-02-07: PersonaManager create path now wraps `savePersona` in try/catch, logs failures, and surfaces the reusable error banner so create problems stop being silent.
- 2026-02-07: Added regression tests for `usePersonas` and `PersonaManager` to lock in loading/error behavior across success and failure paths.
- 2026-02-07: QA confirmed PersonaManager 新建 immediately adds a 自定义画像 entry, selects it, and no loading spinner remained; view captured at .sisyphus/evidence/task-qa-persona-create.png
- 2026-02-07: Removed the stray `types/react-jsx-runtime.d.ts` stub so the build relies on the official React runtime typings; test/build cycles still succeed.
