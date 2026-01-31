
## 🚨 CRITICAL: Missing Default Holiday Initialization in App.tsx
**Discovered**: 2026-02-01 (E2E Testing - Task 8)
**Severity**: HIGH (Production Blocker)
**Status**: IDENTIFIED - Requires Fix

### Problem Description
The `initDefaultHolidays()` function exists in `services/holidayService.ts` but is **NOT called** during application initialization in `App.tsx`.

### Impact
- **User Experience**: Fresh browsers/new users see empty holiday list
- **Usability**: Users must manually add all 7 default Chinese holidays
- **Consistency**: Other collections (tariffs, time_configs) are properly initialized
- **Testing**: E2E tests required manual initialization via console

### Root Cause Analysis
**File**: `App.tsx`, lines 40-106 (initDB function)

**Current Behavior**:
```typescript
const initDB = async () => {
  // ... tariffs initialization
  // ... time_configs initialization
  // ❌ MISSING: holidays initialization
  setInitialized(true);
};
```

**Expected Behavior**:
```typescript
const initDB = async () => {
  // ... existing code ...
  
  // ✅ Add holiday initialization
  const existingHolidayCount = await db.holidays.count().exec();
  if (existingHolidayCount === 0) {
    await initDefaultHolidays();
  }
  
  setInitialized(true);
};
```

### Evidence
- E2E test screenshots show empty holiday list on first load
- Required manual console command: `initDefaultHolidays()` to populate
- Test file `holidayService.test.ts` shows `initDefaultHolidays` working correctly
- No import of `initDefaultHolidays` in `App.tsx`

### Recommended Fix
**Step 1**: Import the function
```typescript
// In App.tsx, line 17
import { getDatabase } from './services/db';
import { initDefaultHolidays } from './services/holidayService'; // ADD THIS
```

**Step 2**: Call during initialization
```typescript
// In initDB function, after line 81 (after time_configs initialization)
const existingHolidayCount = await db.holidays.count().exec();
if (existingHolidayCount === 0) {
  console.log('[App] Initializing default holidays');
  await initDefaultHolidays();
}
```

### Workarounds
**For Development/Testing**:
1. Open browser console
2. Run:
   ```javascript
   const { initDefaultHolidays } = await import('/services/holidayService.ts');
   await initDefaultHolidays();
   ```
3. Refresh page

**For Users**:
- Manually add holidays via HolidayManager UI (poor UX)

### Related Files
- `App.tsx` (needs modification)
- `services/holidayService.ts` (function exists, working correctly)
- `services/db.ts` (schema correct)
- `hooks/useDatabase.ts` (useHolidays hook working)

### Testing Impact
- Unit tests: ✅ All pass (221/221)
- E2E tests: ⚠️ Required manual initialization
- Build: ✅ Success

### Priority Justification
**HIGH** because:
1. Affects all new users immediately
2. Breaks expected out-of-box experience
3. Simple fix with low risk
4. Already tested and verified working
5. Inconsistent with other collection initialization

### Next Steps
1. ⬜ Apply recommended fix to `App.tsx`
2. ⬜ Test initialization in clean browser (IndexedDB cleared)
3. ⬜ Verify no regression in existing initialization logic
4. ⬜ Update E2E test to verify automatic initialization
5. ⬜ Deploy to production

### Resolution Status
- [ ] Fix Applied
- [ ] Tested in Clean Environment
- [ ] Regression Tests Pass
- [ ] E2E Tests Updated
- [ ] Ready for Production
