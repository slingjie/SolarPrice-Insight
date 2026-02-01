# Work Plan: Solar Self-Consumption Analysis Feature

## Context

### User Request
Implement a "Solar Self-Consumption Analysis" feature.
- **Input**:
  - Total Monthly Consumption (kWh).
  - Operating Hours (e.g., 08:00 - 17:00).
  - Estimated Solar Generation (kWh/month) OR System Size (kWp).
- **Output**:
  - Self-Consumption Rate (%).
  - Grid Interaction (Import/Export).
  - Cost Savings Analysis.

### Technical Approach
- **Service Layer**: Extract calculation logic to `services/solarCalculator.ts`.
- **UI Layer**: New component `components/SelfConsumptionAnalysis.tsx`.
- **Integration**: Add to `Analysis` or `Dashboard` view.

---

## Work Objectives

### Concrete Deliverables
- **New Service**: `services/solarCalculator.ts` (Pure logic for solar curve vs load curve).
- **New Component**: `components/SelfConsumptionAnalysis.tsx`.
- **Integration**: Add route/tab in `App.tsx` or `Analysis.tsx`.

### Definition of Done
- [x] Solar calculation logic implemented and tested.
- [x] UI allows input of load and solar data.
- [x] Charts visualization (Load vs Solar curve).
- [x] Savings report generated.

---

## Task Flow

```
1. Logic Design (Service) → 2. UI Implementation → 3. Integration & Visualization
```

---

## TODOs

### Phase 1: Logic & Service
- [x] 1. Define Calculation Models (Interfaces)
  **What to do**:
  - Create `types/solar.ts` (or add to `types.ts`).
  - Define `SolarSystem`, `LoadProfile`, `SimulationResult`.

- [x] 2. Implement Solar Generation Simulator
  **What to do**:
  - Create `services/solarCalculator.ts`.
  - Implement `simulateDailySolarCurve(systemSizeKw, month)`: Returns 24h generation array.
  - Implement `simulateLoadCurve(monthlyConsumption, startHour, endHour)`: Returns 24h load array.

- [x] 3. Implement Balance Calculator
  **What to do**:
  - Add `calculateSelfConsumption(solarCurve, loadCurve)` to service.
  - Returns: selfConsumptionKwh, exportKwh, importKwh.

- [x] 4. Unit Tests for Solar Service
  **What to do**:
  - Create `services/solarCalculator.test.ts`.
  - Verify curve generation and balance math.

### Phase 2: User Interface
- [x] 5. Create Analysis Component Scaffold
  **What to do**:
  - Create `components/SelfConsumptionAnalysis.tsx`.
  - Add input forms: System Size, Monthly Load, Work Hours.

- [x] 6. Implement Interactive Charts
  **What to do**:
  - Use Recharts to show "Solar vs Load" overlay chart (24h).
  - Show "Energy Balance" bar chart (Self-consumed vs Grid).

- [x] 7. Implement Results Summary
  **What to do**:
  - Display KPI cards: Self-consumption Rate %, Bill Savings ¥.

### Phase 3: Integration
- [x] 8. Add Navigation Entry
  **What to do**:
  - Add to Sidebar or Analysis tabs.

- [x] 9. Connect to Price Engine
  **What to do**:
  - Use `priceCalculator` service to calculate monetary value of self-consumed energy (avoided cost).

---

## Success Criteria
- [x] User can see how much solar energy they will actually use vs sell.
- [x] Charts clearly show the "overlap" between sun and work hours.
