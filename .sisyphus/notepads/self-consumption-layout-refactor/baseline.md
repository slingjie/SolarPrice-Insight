# Baseline Verification - Self-Consumption Layout Refactor

## 1. Commands Status
- `npm run test`: **Passed** (225 tests)
- `npm run build`: **Passed** (vite build succeeded)

## 2. Layout Structure Analysis

### Main Container
- **Component**: `components/SelfConsumption/index.tsx`
- **Main Wrapper**: `<main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8" data-testid="sc-main">`
- **Inner Container**: `<div className="max-w-7xl 2xl:max-w-none mx-auto space-y-8 pb-20" data-testid="sc-container">`

### Layout Anchors
1.  **Sidebar Offset**:
    - Sidebar is fixed with width `w-20 lg:w-64`.
    - Main content has matching left margin `ml-20 lg:ml-64`.
2.  **Input Sections (Left Column, Accordion)**:
    - Occupies `lg:col-span-4`.
    - **Project Info**: `data-testid="section-project"` (Lines 498-554)
    - **Load Data**: `data-testid="section-load"` (Lines 557-679)
    - **Tariff Config**: `data-testid="section-tariff"` (Lines 682-742)
    - **PV System**: `data-testid="section-pv"` (Lines 745-904)
3.  **Result Section / Guidance (Right Column)**:
    - Occupies `lg:col-span-8`.
    - **Empty State / Guidance**: `data-testid="sc-empty-state"` (Lines 912-964). Shown when `!results`.
    - **Load Preview**: Collapsible section `data-testid="sc-load-preview"` (Line 968+).
    - **Results**: Rendered in the same column when `results` is present (beyond line 988, not fully analyzed but confirmed placement).
4.  **Scroll Containers**:
    - Primary: `<main className="flex-1 ... overflow-y-auto ...">` in `App.tsx` (Line 203).
    - Local: Holiday selection has `max-h-32 overflow-y-auto` (Line 649).

## 3. Evidence
- Desktop Screenshot: `.sisyphus/evidence/sc-before-desktop.png`
- Mobile Screenshot: `.sisyphus/evidence/sc-before-mobile.png`

## 4. Observations
- The page uses a two-column grid layout on desktop (`lg:grid-cols-12`).
- Left column (4/12) is an accordion of inputs.
- Right column (8/12) shows either guidance or results.
- Sidebar is fixed and handles its own responsive width.
- The `App.tsx` provides the main scrollable area, which might cause issues if internal components also try to scroll or if we want sticky headers/sections.
