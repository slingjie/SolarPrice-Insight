
## 2026-02-01: Holiday Support Architecture

### Decision: Holiday Priority in Day Type Classification
**Context**: When a date can be classified as both a weekend (restday) and a holiday, we need to determine which takes precedence.

**Decision**: Holiday takes highest priority in day type classification.

**Priority Order**:
1. Holiday (highest) → 'holiday' → Level D
2. Weekend (restday) → 'restday' → Level C  
3. Workday → 'workday' → Level A or B (based on hour)

**Rationale**:
- Holidays typically have different load patterns than regular weekends
- Users need to distinguish holiday behavior from weekend behavior
- Enables more accurate consumption modeling for special occasions
- Matches real-world energy consumption patterns where holidays often have unique characteristics

**Implementation**: Check holidays list first in `getDayType()` before checking weekend status.

---

## Decision: Backward Compatibility via Optional Parameters
**Context**: Existing code uses the service without holiday support.

**Decision**: Make R_D and holidays optional parameters with safe defaults.

**Implementation**:
- `holidays?: string[]` defaults to `[]` in `getDayType()`
- `R_D?: number` and `N_D?: number` default to `0` in `solveMonthlyBasePower()`
- `P_work_D` only calculated when `N_D > 0`

**Rationale**:
- Zero-breaking-change migration path
- Existing callers continue to work without modification
- New functionality opt-in rather than forced
- Maintains test coverage for existing behavior

