# Work Plan: Time-of-Use Tariff Insight Optimization (Refined)

## Context

### Original Request
Optimize the "Time-of-Use Tariff Insight" feature. User explicitly **rejected** "Shadow Simulation" (active insight) but **approved** logic refactoring and UX flow fixes.

### Goals
1.  **UX Flow**: Fix "dead ends" (empty states, upload dependency) and improve usability (batch month selection).
2.  **Code Health**: Extract calculation logic to a pure service (`services/priceCalculator.ts`) for maintainability.

### Guardrails
- **MUST**: Extract logic to pure functions (`services/priceCalculator.ts`).
- **MUST NOT**: Implement "Shadow Simulation" (removed per user request).
- **MUST NOT**: Add charting or prediction features.

---

## Work Objectives

### Concrete Deliverables
- **New Service**: `services/priceCalculator.ts` (Pure calculation logic).
- **UX Improvements**:
    - Empty state redirection in `ComprehensivePriceCalculator`.
    - "Quick Config" / Default Config in `SmartUpload`.
    - "Batch Select" (Select All/Summer/Winter) in `ComprehensivePriceCalculator`.

### Definition of Done
- [x] Logic extracted and unit tested (Regression free).
- [x] Empty state guides user to upload page.
- [x] Smart Upload allows proceeding without pre-existing config.
- [x] Month selection has batch shortcuts.
- [x] `npm run build` passes.

---

## Verification Strategy
- **TDD**: Write tests for `calculateAveragePrice` to ensure the extracted logic matches the original perfectly.
- **Manual QA**: Verify the "Batch Select" buttons work and the "Upload" flow is unblocked.

---

## Task Flow

```
1. Logic Extraction (TDD) → 2. UX: Empty State & Upload Fix → 3. UX: Batch Selection
```

---

## TODOs

- [x] 1. Create `services/priceCalculator.ts` and Test Suite
  **What to do**:
  - Extract pure functions: `timeToMinutes`, `getOverlapMinutes`, `getTimeSegments`.
  - Implement `calculateAveragePrice` (main logic) in the service.
  - Write strict regression tests to match current behavior.

  **References**:
  - Logic Source: `components/ComprehensivePriceCalculator.tsx:243-318`.

  **Acceptance Criteria**:
  - [x] `npm test services/priceCalculator.test.ts` passes.
  - [x] Calculation output matches legacy component exactly.

- [x] 2. Refactor `ComprehensivePriceCalculator.tsx` to Use Service
  **What to do**:
  - Replace internal logic with `priceCalculator.calculateAveragePrice`.
  - Ensure UI behaves exactly the same (Regression Check).

- [x] 3. Fix Empty State & Navigation (UX)
  **What to do**:
  - In `ComprehensivePriceCalculator`, checks if `dbProvinces` is empty.
  - Show "No Data - Go to Upload" button.
  - Connect `onNavigate` prop correctly.

- [x] 4. Unblock Smart Upload (Quick Config)
  **What to do**:
  - In `SmartUpload.tsx`, if no time configs exist:
  - Show "Use Default Config" button.
  - Create a standard Peak/Valley config in DB on click.

- [x] 5. Implement Batch Month Selection
  **What to do**:
  - In `ComprehensivePriceCalculator`, add buttons: "Select All", "Summer (6-9)", "Winter (12-2)".
  - Update `formData.months` state accordingly.

  **Acceptance Criteria**:
  - [x] Clicking "Select All" checks all months.
  - [x] Clicking "Summer" checks only summer months.

---

## Success Criteria
- [x] Code is cleaner (Calculator component shrinks).
- [x] Users never hit a "dead end" (empty state or stuck upload).
- [x] Month selection is fast.
