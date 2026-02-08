# Draft: Load Visualization Improvements

## Current State Analysis
- **File**: `components/consumption/ConsumptionAnalysis.tsx`
- **Charts**:
  1. Bar Chart: Monthly Energy (PV vs Load vs Self-consumed)
  2. Line Chart: Self-Consumption/Sufficiency Rates
  3. Area Chart: Generation Breakdown
  4. Area Chart: "Typical Daily Profile" (Averages *all* data into one 0-23h curve)
- **Data Availability**: `HourlyConsumptionResult` contains 8760 hourly points. `types.ts` defines `DayType` (workday/restday/holiday), so the logic exists but isn't used in visualization.

## User Request
- Improve "Typical Day" to show Workday vs. Non-workday vs. Holiday.
- Suggest other visualization schemes.

## Proposed Visualization Schemes

### Scheme A: Multi-Scenario Daily Profile (The Core Request)
- **Concept**: Split the single "Average" curve into 3 curves.
- **Lines**:
  - `Workday Avg` (e.g., Mon-Fri)
  - `Weekend Avg` (Sat-Sun)
  - `Holiday Avg` (Specific dates)
- **Why**: Reveals operational patterns (e.g., "Why is Sunday load 50% of Monday? Is equipment left on?").
- **Tech**: Recharts `LineChart` or `AreaChart` with multiple series.

### Scheme B: Annual Load Heatmap (Carpet Plot)
- **Concept**: 2D Grid. X-axis = Date (Jan 1 - Dec 31), Y-axis = Hour (0-23). Color = Load (kW).
- **Why**: "God View". Instantly highlights:
  - Start/Stop times (vertical lines).
  - Seasonal shifts (color changes across months).
  - Abnormal "ghost load" at night.
- **Tech**: **ECharts** Heatmap (already in `package.json`). Recharts struggles with this.

### Scheme C: Load Duration Curve (LDC)
- **Concept**: Sort all 8760 hourly load values from highest to lowest. X-axis = % of Time, Y-axis = Load (kW).
- **Why**: Critical for system sizing. Answers: "Do we need a 1000kW transformer for a peak that only happens 1 hour a year?"
- **Tech**: Recharts `AreaChart` (monotonic decreasing).

### Scheme D: Box Plot Analysis (Hourly Variability)
- **Concept**: For each hour (0-23), show the Min, Q1, Median, Q3, Max load across the year.
- **Why**: Shows *stability*. An average of 500kW could mean "always 500kW" or "0kW half the time, 1000kW half the time". Averages hide this; Box Plots reveal it.
- **Tech**: ECharts Boxplot (best support).

## Implementation Plan
- **Phase 1**: Implement Scheme A (Workday/Weekend split) in `ConsumptionAnalysis.tsx`.
- **Phase 2 (Optional)**: Add a new "Advanced Analysis" tab/section for Heatmap (Scheme B) and LDC (Scheme C).
- **Phase 3**: Refactor `useMemo` logic to handle the filtering efficiently.
