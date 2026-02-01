# Learnings - Consumption Refactor

## Conventions & Patterns

## Task 1: TimeKey Utilities (Wave 1 - Foundations)

### Implementation Summary
- **Files Created**: `utils/timeKey.ts` (93 lines) + `utils/timeKey.test.ts` (231 lines)
- **Test Coverage**: 39 test cases, 100% pass rate
- **Build Status**: ✓ PASS (no TypeScript errors)

### Key Functions Implemented

1. **toChinaHourKeyFromIsoUtc(isoUtc: string): string**
   - Parses ISO UTC timestamp (e.g., "2005-01-01T00:10:00Z")
   - Adds 8 hours for China Time (+08:00)
   - Floors minutes to hour boundary (critical for PVGIS alignment)
   - Handles cross-day, cross-month, cross-year wrapping
   - Returns zero-padded key: "MM-DD HH:00"

2. **toHourKeyFromMonthDayHour(month, day, hour): string**
   - Direct hour key generation from components
   - Used by toChinaHourKeyFromIsoUtc and internal calculations
   - Zero-pads all components

3. **toIsoLocalFromMonthDayHour(baseYear, month, day, hour): string**
   - Converts back to ISO Local format for UI display
   - Fixed timezone: "+08:00" (China Time)
   - Format: "YYYY-MM-DDTHH:00:00+08:00"
   - Enables consistent display across environments

4. **hourKeyToMonthDayHour(key: string): {month, day, hour}**
   - Parses hour key back to components
   - Validates month (1-12), day (1-31), hour (0-23)
   - Throws on invalid format or out-of-range values
   - Critical for aggregation and weekday calculations

### Test Coverage Highlights

**Core UTC→China +8 Conversion (8 tests)**
- ✓ Minute flooring (10, 45 → both floor to :00)
- ✓ Cross-day shift (23:30 UTC → next day, China time)
- ✓ Cross-month shift (Jan 31 UTC → Feb 1 China)
- ✓ Cross-year shift (Dec 31 UTC → Jan 1 China; year wraps 2005→2021 canonical)

**Edge Cases (6 tests)**
- ✓ Feb 28/29 boundary (non-leap 2021)
- ✓ Hour 0 and Hour 23 boundaries
- ✓ Day 1 and Day 31 boundaries
- ✓ Month padding (single-digit months)

**Round-trip & Integration (4 tests)**
- ✓ PVGIS entry: 2005-01-01T00:10:00Z → 01-01 08:00 → IsoLocal → back to components
- ✓ Multiple PVGIS hours (minute variations) accumulate to same key
- ✓ Weekday calculation enablement (Date.UTC determinism for 2021-01-02=Saturday, 2021-01-03=Sunday)

**Parsing & Validation (6 tests)**
- ✓ Invalid format detection
- ✓ Out-of-range month/day/hour rejection
- ✓ Zero-padding preservation

### Patterns Observed from Existing Code

**Source: services/consumptionCalcService.ts**
- Used `convertUtcToChina()` + `generateTimeKey()` pattern
- Manual day/month/year wrapping with DAYS_IN_MONTH lookup
- Time key format: "MM-DD HH:00" (zero-padded)

**Source: services/pvgisService.ts**
- PVGIS outputs UTC timestamps with minutes: "2005-01-01T00:10:00Z"
- `parsePVGISTime()` extracts components from format "YYYYMMDD:HHMM"
- `parsePvgisTimeToIsoUtc()` converts to ISO format with Z suffix

**Integration Point**
- PVGIS data (year-agnostic) merged with 2021 canonical 8760-hour calendar
- Minute flooring essential to normalize PVGIS granularity to hour boundary
- TimeKey enables deterministic aggregation across all consumers

### Semantic Decisions (Locked)

1. **Year Handling**: PVGIS input ignores year; month-day-hour extracted only. Enables cross-year data reuse.
2. **Timezone Determinism**: `Date.UTC(baseYear, month-1, day)` for weekday calculation avoids environment TZ dependency.
3. **Month Wrapping**: Cross-year shifts wrap within 1-12 (e.g., month 13 → 1, month 0 → 12).
4. **Minute Flooring**: Always floor to hour start (`:10:00` → `:00:00`), not round. Matches PVGIS typical hourly aggregation.

### Dependencies & Consumers

**No Dependencies**: Utility module is pure (no external services, no DB).

**Expected Consumers** (Wave 2-3):
- `services/consumptionAlignedService.ts` (3-level load engine)
- `utils/timeConfigResolver.ts` (month pattern parsing)
- Chart aggregation functions (typical day, monthly rollup)
- Tariff matching logic (month extraction from TimeKey)

### Notes for Future Waves

- **Leap Year**: Plan specifies baseYear=2021 (non-leap, 8760 hours). Feb 29 never produced. Tests validate this boundary.
- **Reuse**: `hourKeyToMonthDayHour()` enables weekday calculation without additional Date manipulation—critical for deterministic `workPattern` Level assignment (A/B/C).
- **Display**: `toIsoLocalFromMonthDayHour()` avoids `new Date(string)` (locale-dependent). Always explicit +08:00.


## Task 2: Consumption Excel Parser - Dual Format Support

### Implementation Summary
- **Files Modified**: `utils/excelParser.ts` (extended from 117 → 274 lines) + `utils/excelParser.test.ts` (extended from 226 → 432 lines)
- **Test Coverage**: 24 test cases (all PASS)
  - 13 existing month-row format tests (preserved, all pass)
  - 11 new tou-row format tests (comprehensive coverage)
- **Build Status**: ✓ PASS (no TypeScript errors)

### Format Detection Strategy

**Month-Row Format (existing, preserved)**
- Columns: `月份/Month` (first column) + TOU fields (尖/峰/平/谷/深)
- Rows: One row per month (1-12)
- Example:
  ```
  月份  尖   峰   平   谷   深谷
  1    100  200  300  400  50
  2    110  210  310  410  55
  ```

**Tou-Row Format (new, reference-aligned)**
- Columns: `tou` (first column) + month columns (Jan/1月/1, Feb/2月/2, ..., Dec/12月/12)
- Rows: One row per TOU type (尖/峰/平/谷/深)
- Example:
  ```
  tou  1月  2月  3月
  尖   100  110  120
  峰   200  210  220
  平   300  310  320
  谷   400  410  420
  深   50   55   60
  ```

### Auto-Detection Logic

```typescript
detectFormat(headers, firstRow): 'month-row' | 'tou-row' | null {
  1. Check for month-row: find "月份/Month" column + verify ≥1 TOU field exists
  2. Check for tou-row: find "tou" column + verify first row has valid TOU label + ≥1 month column
  3. Return null if neither detected → throw format detection error
}
```

**Detection Edge Cases Handled**
- Mixed case headers (尖峰 vs ZFPEAK) → normalized before matching
- Case-insensitive matching for both formats
- Numeric month columns (1, 2, 3) parsed directly via `parseInt(header)` fallback

### TOU Label Normalization

**Supported Aliases** (locked per plan):
- tip: `tip`, `尖`, `尖峰`, `尖时`
- peak: `peak`, `峰`, `高峰`
- flat: `flat`, `平`, `平段`
- valley: `valley`, `谷`, `低谷`
- deep: `deep`, `深`, `深谷`

**Month Detection** (English/Chinese/Numeric):
- English: `Jan`, `Feb`, ..., `Dec` + full names (`January`, `February`, ...)
- Chinese: `1月`, `2月`, ..., `12月`
- Numeric: Direct `parseInt()` for columns labeled 1-12

### Parsing Implementation Details

**Month-Row Parser** (`parseMonthRowFormat`)
- Maps header columns to TOU field names via regex patterns
- Iterates rows, extracts month + TOU values
- Skips rows with invalid month values
- Returns sorted `MonthlyConsumption[]` (month 1-12)

**Tou-Row Parser** (`parseTouRowFormat`)
- Identifies tou column + all month columns
- Initializes `monthMap` only for detected months (no zero-filling of all 12)
- Iterates rows, normalizes TOU label, extracts consumption per month
- **Accumulates** duplicate TOU labels (e.g., two "尖" rows → sum their values)
- Returns sorted `MonthlyConsumption[]` (month 1-12)

### Output Guarantee

Both formats produce identical `MonthlyConsumption[]` output:
```typescript
interface MonthlyConsumption {
  month: 1-12,
  tip: number,     // alias for 尖
  peak: number,    // alias for 峰
  flat: number,    // alias for 平
  valley: number,  // alias for 谷
  deep: number     // alias for 深, defaults to 0 if missing
}
```

**Cross-Format Equivalence Test** ✓ PASS
```
Same data in month-row format → identical output ✓
Same data in tou-row format  → identical output ✓
Both outputs equal            → true ✓
```

### Test Coverage Highlights

**Month-Row Format (13 tests)**
- Standard Chinese headers ✓
- English headers ✓
- Alternative labels (尖峰, 高峰, 平段, 低谷) ✓
- Month formats (1月, 2月, numeric) ✓
- Missing columns (default to 0) ✓
- Empty cells (default to 0) ✓
- Number parsing (comma separators, strings) ✓
- Error cases (empty file, no month, invalid months) ✓
- Row ordering (skips invalid, preserves valid) ✓

**Tou-Row Format (11 tests)**
- Chinese month names (1月, 2月, 3月) ✓
- English month names (Jan, Feb, Mar) ✓
- Numeric month columns (1, 2, 3) ✓
- Missing TOU fields (default to 0) ✓
- Alternative TOU labels (尖峰, 高峰, etc.) ✓
- Invalid TOU labels (skip rows) ✓
- Empty cells (default to 0) ✓
- Duplicate TOU rows (accumulate values) ✓
- Cross-format equivalence (month-row = tou-row) ✓
- Mixed English/Chinese months ✓
- Month sorting ✓

### Critical Design Decisions (Locked)

1. **Only-Detected-Months Initialization**: Tou-row parser initializes monthMap only for months found in column headers. This prevents zero-filling months not in data (critical for scenarios with partial-year data).

2. **Duplicate Accumulation**: Tou-row format can have multiple rows for same TOU label (data quality variation). Parser **sums** them rather than replacing. Matches reference repo behavior.

3. **Numeric Month Fallback**: After regex patterns fail, parser tries direct `parseInt(header)` to catch numeric columns that XLSX may preserve as numbers or strings.

4. **Deep Field Default**: Both formats default `deep` to 0 if missing (consistent with existing month-row behavior and plan semantics).

5. **Error Priority**: Format detection throws single unified error ("Unable to detect...") rather than cascading specific errors. Avoids user confusion with multiple error messages.

### Dependencies & Integration

**No New Dependencies**: Reuses existing XLSX library.

**Consumers (Next Waves)**
- `services/consumptionAlignedService.ts` (Task 5): Will receive `MonthlyConsumption[]` regardless of input format
- UI File Upload: Can accept both formats transparently
- Testing: Reference repo tou-row example files now compatible

### Notes for Future Waves

- **Format Flexibility**: Parser auto-detects without user hints; UI doesn't need "choose format" dropdown
- **Data Resilience**: Duplicate TOU rows, mixed month formats, partial data all handled deterministically
- **Error Clarity**: Failing imports now clearly state "Unable to detect format" + expected column patterns
- **Month Completeness**: Output always sorted by month; missing months appear as zero-valued entries (for month-row only; tou-row omits them)


## Task 4: TimeConfig month_pattern Resolver (Wave 1 - Foundations)

### Implementation Summary
- **Files Created**: `utils/timeConfigResolver.ts` (78 lines) + `utils/timeConfigResolver.test.ts` (127 lines)
- **Test Coverage**: 11 test cases, 100% pass rate
- **Build Status**: ✓ PASS

### Key Function Implemented

**resolveTimeConfigForMonth(timeConfigs, provinceName, month): ResolvedTimeConfig | null**
- Input: Array of TimeConfig, province name, target month (1-12)
- Output: `{ timeRules, touGrid }` where touGrid is TimeType[24] from rulesToGrid()
- Returns null if no match found

### month_pattern Parsing Rules

**"All" (case-insensitive)**:
- Matches all months 1-12
- Normalized: `all`, `All`, `ALL` → all valid

**Comma-separated**:
- Format: `"6,7,8"` → months [6, 7, 8]
- Invalid tokens silently ignored: `"6,invalid,7,99,-1"` → only [6, 7] kept
- Range 1-12 enforced

### Priority Tiers (Exact Order)

1. **province exact + month in pattern**
2. **province exact + month_pattern === "All"**
3. **province === "全部" + month in pattern**
4. **province === "全部" + month_pattern === "All"**

### Conflict Resolution (Same Priority)

**Primary**: `last_modified` newest (Date comparison)
**Fallback**: `id` lexicographic smallest (string compare)

Example: Same province + pattern + last_modified → choose smallest id

### Integration Points

**Consumers** (Wave 2):
- `services/consumptionAlignedService.ts` (3-level load engine) - uses touGrid for TOU assignment
- Tariff matching logic - extracts month from TimeKey for tariff selection

**Dependencies**:
- `utils/timeUtils.ts:rulesToGrid()` - generates 24-hour TOU grid from rules
- `types.ts:TimeConfig/TimeRule/TimeType` - core data structures

### Test Coverage Highlights

**month_pattern Parsing** (3 tests):
- ✓ Case-insensitive "All" (all/All/ALL)
- ✓ Comma-separated months ("6,7,8")
- ✓ Invalid token filtering (NaN, <1, >12 ignored)

**Priority Matching** (4 tests):
- ✓ Tier 1: province exact + month
- ✓ Tier 2: province exact + All
- ✓ Tier 3: 全部 + month
- ✓ Tier 4: 全部 + All

**Conflict Resolution** (2 tests):
- ✓ last_modified newest wins
- ✓ id smallest wins (when last_modified equal)

**Edge Cases** (2 tests):
- ✓ No match found → null
- ✓ touGrid generation via rulesToGrid

### Wave 1 Completion Status

✅ Task 1: TimeKey utilities (39 tests)
✅ Task 2: Excel parser tou-row (24 tests)
✅ Task 3: PV Excel 24x12 parser (8 tests)
✅ Task 4: TimeConfig month_pattern resolver (11 tests)

**Total**: 82 tests, 100% pass rate, 4/4 tasks complete

**Next**: Wave 2 (Core Engine) - Tasks 5-6


## Task 4: TimeConfig Month Pattern Resolver + TOU Grid Selection

### Implementation Summary
- **Files Created**: `utils/timeConfigResolver.ts` (165 lines) + `utils/timeConfigResolver.test.ts` (test suite with 11 tests)
- **Test Coverage**: 11 test cases, 100% pass rate
- **Build Status**: ✓ PASS (npm run build successful)

### Functions Implemented

1. **parseMonthPattern(pattern: string): Set<number>**
   - Parses month_pattern into a Set of valid months (1-12)
   - "All" (case-insensitive) expands to all 12 months
   - Comma-separated format "1,2,3,6,7,8" parsed correctly
   - Invalid tokens (NaN, <1, >12, non-numeric) silently ignored
   - Whitespace trimmed from each token
   - Returns empty Set for malformed input

2. **resolveTimeConfigForMonth(timeConfigs, provinceName, month): { timeRules, touGrid } | null**
   - Implements locked 4-tier priority system:
     * Tier 1: `province === provinceName && month in month_pattern`
     * Tier 2: `province === provinceName && month_pattern === 'All'`
     * Tier 3: `province === '全部' && month in month_pattern`
     * Tier 4: `province === '全部' && month_pattern === 'All'`
   - Returns object with `timeRules: TimeRule[]` and `touGrid: TimeType[24]`
   - Calls `rulesToGrid(timeRules)` to generate 24-hour TOU grid

3. **resolveConflict(candidates: TimeConfig[]): TimeConfig | null** (internal)
   - Conflict resolution for same-tier candidates:
     * Primary: Sort by `last_modified` descending (newest first)
     * Fallback: Sort by `id` ascending (lexicographically smallest)
   - Returns selected config or null if empty

### Test Coverage Highlights

**Month Pattern Parsing (3 tests)**
- ✓ "All" case-insensitivity (All, all, ALL)
- ✓ Comma-separated parsing (6,7,8 → Set{6,7,8})
- ✓ Invalid token filtering (6,invalid,7,99,-1 → ignores invalid)

**Priority Resolution (7 tests)**
- ✓ Tier 1 exact match over all others
- ✓ Tier 1 month in pattern vs outside
- ✓ Tier 2 fallback (province exact + All)
- ✓ Tier 3 fallback (全部 + month match)
- ✓ Tier 4 fallback (全部 + All)
- ✓ Conflict: newest `last_modified` wins
- ✓ Conflict: smallest `id` wins when dates equal

**Output Format (2 tests)**
- ✓ Returns null when no match found
- ✓ Returns `{ timeRules, touGrid }` with touGrid.length === 24

### Critical Design Decisions (Locked)

1. **Month Pattern Case-Insensitivity**: "All", "all", "ALL" all map to [1..12]. Supports future variants without code changes.

2. **Silent Invalid Token Handling**: Non-numeric tokens and out-of-range numbers (>12 or <1) are silently filtered. Data resilience: partial bad data doesn't fail entire parse.

3. **Exact Province Matching**: No normalization here (Task 7 handles that). Tier 3-4 use exact string "全部" (Chinese for "all/global").

4. **Conflict Tiebreaker Determinism**: 
   - `last_modified` as ISO string parsed via `new Date(string).getTime()` enables cross-timezone reproducibility
   - `id` lexicographic sort provides stable secondary fallback (no randomness)

5. **Deleted Config Filtering**: `_deleted` flag checked early; inactive configs never enter priority tiers.

6. **TOU Grid Generation**: Delegates to existing `rulesToGrid()` utility (from Task 1). Resolver responsible only for selection logic.

### Dependencies & Integration

**No new external dependencies**: Uses only TypeScript stdlib and existing utilities.

**Expected Consumers (Tasks 5+)**:
- `services/consumptionAlignedService.ts`: Will call `resolveTimeConfigForMonth()` for each month (1..12) to fetch month-specific rules
- UI components: May call resolver to preview TOU grid for selected province/month

### Notes for Future Waves

- **Task 5 Integration**: Engine will iterate months 1-12, calling resolver for each; aggregate results across all months
- **Task 7 Province Normalization**: Once enabled, normalization layer will wrap resolver calls to handle "江苏" vs "江苏省" equivalence
- **Leaf node responsibility**: Resolver is purely selection logic. All business rules (priority, conflict, pattern parsing) are explicit and tested


## Task 3: PV Excel 24x12 Parser (Wave 1 - Foundations)

### Implementation Summary
- **Files Created**: `utils/pvExcelParser.ts` (158 lines) + `utils/pvExcelParser.test.ts` (140 lines)
- **Test Coverage**: 8 test cases, 100% pass rate
- **Build Status**: ✓ PASS (npm run test -- utils/pvExcelParser.test.ts)

### Key Function Implemented

**parsePVExcelFile(file: File | Buffer | ArrayBuffer): Promise<Map<string, number>>**
- Input: Excel file with 24-hour rows × 12-month columns in Wh/kWp format
- Output: `Map<TimeKey, Wh/kWp>` with 8760 entries (365 days × 24 hours)
- Each monthly 24-hour profile repeated across all days in that month (baseYear=2021, non-leap)
- TimeKey format: `MM-DD HH:00` (zero-padded)

### Month Column Detection Strategy

**Reused from Task 2 (excelParser.ts)**:
- English months: `Jan`, `Feb`, ..., `Dec` (full names also supported)
- Chinese months: `1月`, `2月`, ..., `12月`
- Numeric columns: Direct `parseInt()` for 1-12

**Pattern matching**: Case-insensitive regex patterns, consistent with excelParser.ts

### Hour Label Parsing

**Supported formats**:
- `"0 - 1"`, `"0-1"` → hour 0
- `"23 - 24"`, `"23-24"` → hour 23
- Regex: `/^(\d+)\s*-\s*(\d+)$/`
- Extracts first number as hourStart (must be 0-23)

**Validation**: Rejects invalid hour labels with error message including row number

### 24-Row Validation

**Strict enforcement**:
- Exactly 24 data rows required (after header)
- Rejects files with <24 or >24 rows
- Error includes actual count: `"Expected 24 hour rows, got N"`

### 8760-Hour Expansion Logic

**Days per month** (baseYear=2021, non-leap):
```
[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
```

**Algorithm**:
1. Parse 24 hour rows into `Map<month, Map<hour, Wh/kWp>>`
2. For each month (1-12):
   - For each day in month:
     - For each hour (0-23):
       - Generate TimeKey: `toHourKeyFromMonthDayHour(month, day, hour)`
       - Copy value from hourly profile (or 0 if missing)

**Result**: Exactly 8760 entries (verified by test)

### Numerical Value Parsing

**Robust handling**:
- Empty cells → 0
- Invalid strings (non-numeric) → 0
- Valid numbers (int/float) → parsed as-is
- Missing cells → 0

**Strategy**: `parseFloat(String(value))` with isNaN fallback

### File Format Support

**Input types**:
- `File` (browser File API)
- `Buffer` (Node.js buffer)
- `ArrayBuffer` (raw binary)

**XLSX usage**:
- `XLSX.read(buffer, { type: 'buffer' })`
- `sheet_to_json(sheet, { header: 1 })` → `unknown[][]` format
- No sheet selection: uses first sheet by name

### Error Handling

**All errors are thrown with name `PVExcelParseError`**:
- No sheets → "Excel file has no sheets"
- Insufficient rows → "Excel file must have header row + data rows"
- No months → "No valid month columns detected"
- Row count mismatch → "Expected 24 hour rows, got N"
- Invalid hour label → "Invalid hour label at row N: ..."

### Test Coverage Highlights

**Month Detection (3 tests)**:
- ✓ English names (Jan-Dec)
- ✓ Chinese names (1月-12月)
- ✓ Numeric columns (1-12)

**24-Hour Validation (3 tests)**:
- ✓ Accepts exactly 24 rows
- ✓ Rejects <24 rows with error
- ✓ Rejects >24 rows with error

**Hour Label Parsing (3 tests)**:
- ✓ "0 - 1" format (with spaces)
- ✓ "0-1" format (no spaces)
- ✓ "23 - 24" correctly mapped to hour 23

**Numerical Parsing (3 tests)**:
- ✓ Numeric values preserved as-is (150.5)
- ✓ Empty cells → 0
- ✓ Invalid text → 0

**8760 Expansion (5 tests)**:
- ✓ Total size = 8760
- ✓ Monthly profile repeated for all days
- ✓ Each day in January has 24 identical hour entries
- ✓ TimeKey format matches `MM-DD HH:00`
- ✓ February has 28 days (no Feb 29 in 2021)

**Output Type (1 test)**:
- ✓ Returns `Map<string, number>`
- ✓ All keys match TimeKey regex
- ✓ All values are numbers

### Critical Design Decisions (Locked)

1. **No Unit Conversion**: Parser outputs Wh/kWp as-is. Conversion to kWh happens in engine: `pvKwh = (WhPerKwp/1000) * pvCapacity`

2. **BaseYear=2021 (Non-Leap)**: Fixed in DAYS_IN_MONTH array. 365 total days, no Feb 29. Aligns with plan requirement.

3. **Month Pattern Reuse**: 100% identical MONTH_PATTERNS from excelParser.ts (Task 2). Ensures consistent month detection across parsers.

4. **TimeKey Generation**: Delegates to `toHourKeyFromMonthDayHour()` from timeKey.ts (Task 1). No duplicate logic.

5. **Silent Month Omission**: If Excel has only 6 months, result has only 8760/2 entries (not zero-padded to 12 months). Caller must handle.

6. **File Format Flexibility**: Accepts File, Buffer, or ArrayBuffer. Enables both browser and Node.js consumers.

### Dependencies & Integration

**No new external dependencies**: Uses existing XLSX library.

**Dependencies** (internal):
- `utils/timeKey.ts:toHourKeyFromMonthDayHour()` (Task 1)
- `utils/excelParser.ts:MONTH_PATTERNS` (Task 2, pattern reference only)

**Expected Consumers** (Tasks 5+):
- `services/consumptionAlignedService.ts` (3-level load engine): Will receive 8760 map and use per-hour values
- UI upload component: Will call parser and display 8760-hour result or error

### Notes for Future Waves

- **Task 5 Engine Integration**: Engine will iterate 8760 entries and match against load/TOU data by TimeKey
- **PVGIS Comparison**: PVGIS produces similar 8760-hour output; both align to same TimeKey format for deterministic join
- **Excel Format Flexibility**: Parser auto-detects month columns; UI can support multiple Excel layouts without code changes

