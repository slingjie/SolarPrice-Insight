# Learnings - Self Consumption Layout Refactor

## Task 2: Layout Skeleton (B2)

- **Structure Confirmation**: The existing layout was already using a `grid-cols-12` structure with a 4/8 split on large screens (`lg:`). This made the "refactor" mostly about stabilizing selectors.
- **Selectors Added**:
  - `data-testid="sc-main"`: Main container (already present).
  - `data-testid="sc-input-column"`: Left column (lg:col-span-4).
  - `data-testid="sc-result-column"`: Right column (lg:col-span-8).
- **Responsive Behavior**: The `lg:grid-cols-12` class implies a single column stack on smaller screens (default `grid-cols-1` is set on the container).
- **Verification**: Build passed successfully.

## Task 3: Accordion Input Sections
- **State Initialization**: Used lazy initialization for `expandedSections` to check `initialPvParams` prop. If PV params exist, we don't auto-expand the PV section, prioritizing the incomplete sections (Project, Load, Tariff).
- **Styling**: Removed `truncate` from summary tags to allow them to wrap as per requirement ("可换行"). Used `text-xs text-gray-500 mt-0.5` for subtitle style.
- **Toggle**: The "Expand All / Collapse All" toggle was already implemented and correctly manipulates the `expandedSections` array.
- **Summary Tags**: Verified that summary tags cover all required fields (Province, Load Status/Pattern, Tariff details, PV capacity/source/loss).

## Task 4: Empty State Guidance
- **Guidance Card Pattern**: Replaced the previous 4-step card with a complete 5-step workflow (Project -> Load -> Tariff -> PV -> Analyze).
- **Dynamic Hints**: Leveraged `isSectionComplete` and `validateInputs` to provide real-time status updates within the guidance card (e.g., showing selected province or "waiting for previous steps").
- **Secondary Entry**: Preserved the "View Load Preview" toggle as a secondary action, ensuring advanced users can still verify data without cluttering the main guidance view.
- **Visual Feedback**: Used color coding (Blue for active/completed, Green for ready-to-analyze) to guide user attention.

## Task 5: Responsive Grid Improvements
- **Observation**: The key input form grids (Work Schedule, Tariff, PV) were already using the `grid-cols-1 sm:grid-cols-2` pattern, likely from a previous iteration or initial implementation.
- **Action**: Identified that the Result/Summary grids were using `grid-cols-2` on mobile, which could be crowded on 390px screens.
- **Fix**: Updated Result grids (Summary Cards and Financial Details) to `grid-cols-1 sm:grid-cols-2 md:grid-cols-4`. This ensures they stack vertically on very small screens, providing better readability and preventing overflow.
- **Outcome**: All key grids (Inputs and Results) now follow a consistent mobile-first responsive pattern (`grid-cols-1` -> `sm:grid-cols-2` -> `md/lg:grid-cols-4` or `12`).

## Task 6: Scroll Behavior Fix
- **Problem**: Potential dual scrolling caused by nested `min-h-screen` and `overflow-y-auto` containers.
- **Solution**: 
  - Removed `min-h-screen` from `SelfConsumption/index.tsx` root div.
  - Confirmed inner `main` (data-testid="sc-main") does not have `overflow-y-auto`.
  - Relied on `App.tsx`'s outer `main` (with `min-h-screen` and `overflow-y-auto`) to handle layout growth.
- **Result**: 
  - Window scrollbar handles scrolling when content exceeds viewport.
  - `AnalysisSidebar` (fixed) remains positioned correctly relative to viewport.
  - No nested scrollbars.


## Task 7: Component Testing (Vitest)
- **Testing Strategy**: Focused on "Structure and Interaction" rather than pixel-perfect layouts.
- **Key Coverage**:
  - **Accordion**: Verified click-to-toggle, multi-open capability, and "Expand/Collapse All" functionality.
  - **Summary Tags**: Confirmed that configuration summaries appear correctly when sections are collapsed.
  - **Empty State**: Verified that the guidance checklist appears when no results are present, and it dynamically updates status colors based on input (e.g., selecting a province marks the first step as complete).
  - **Regression**: Ensured existing functionalities like the Holiday Manager modal still open correctly within the new layout structure.
- **Lessons Learned**: 
  - When testing collapsed sections, remember that their internal elements (like inputs) might be removed from the DOM. Interaction should happen while expanded, then verify results after collapsing.
  - Using `screen.getByDisplayValue` is a reliable way to find select elements when they don't have unique labels or IDs.
  - Testing parent container classes (like `bg-gray-50` vs `bg-blue-50`) is effective for verifying state-driven UI changes in the guidance checklist.

### Automation Regression (Task 8) - Feb 06, 2026
- **Unit Tests**: `npm run test` passed (228 tests in 18 files).
- **Build**: `npm run build` successful (Vite build completed in 4.28s).
- **Smoke Tests (Playwright)**:
  - **Desktop (1920x1080)**: Verified accordion expand/collapse and empty state guidance. Screenshots saved to `.sisyphus/evidence/sc-accordion-desktop.png` and `.sisyphus/evidence/sc-empty-state-desktop.png`.
  - **Mobile (390x844)**: Verified responsive layout and horizontal overflow. Verified accordion functionality on small screens. Screenshot saved to `.sisyphus/evidence/sc-mobile.png`.
  - **Horizontal Scroll**: Confirmed `hasHorizontalScroll: false` on mobile viewport.
- **Engines**: Confirmed "Aligned Engine" (8760h) UI elements are present and correctly linked.
