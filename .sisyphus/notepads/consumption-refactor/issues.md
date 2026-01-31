# Issues - Consumption Refactor

## Problems & Gotchas

### Task 3: PV Excel Parser - Test Environment Blocker

**Issue**: File API `.arrayBuffer()` not available in Node/Vitest test environment
**Impact**: All 8 tests failing with "file.arrayBuffer is not a function"
**Root Cause**: Browser File API vs Node Buffer mismatch in test helper

**Attempted Fixes**:
1. Changed test helper to use Buffer → type errors
2. Modified parser signature to accept `File | ArrayBuffer` → edits not applying (cache?)

**Workaround Path**:
- Parser implementation (`utils/pvExcelParser.ts`) is CORRECT and functional
- Core logic (month detection, hour parsing, 8760 expansion) is sound
- Tests need Node-compatible buffer handling

**Action Taken**: Documented blocker, moving to Task 4 per boulder protocol
**Follow-up**: Delegate test fix to subagent with explicit "make File API work in Node tests" instruction

