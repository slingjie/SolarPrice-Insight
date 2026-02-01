# Refactor Plan: Independent PV Self-Consumption Page

## Goal
Make "PV Self-Consumption" a standalone module with its own Sidebar, distinct from the "Electricity Price" (Dashboard) module.

## Current State
- `App.tsx` renders a single `<Sidebar />` for all views except `pvgis` and `admin`.
- `SelfConsumption` is treated as just another "view" (`view === 'self-consumption'`) inside the main layout.

## Target State
1. **App.tsx**:
   - Treat `self-consumption` like `pvgis` or `admin` (i.e., NO shared Sidebar).
   - Render `SelfConsumption` as a full-screen module.
2. **SelfConsumption/index.tsx**:
   - Needs its own internal layout.
   - Needs its own internal Sidebar (if the user wants sub-navigation within this module).
   - *Clarification*: Does the user want a Sidebar *within* this module (e.g., for "Input", "Results", "Settings" sub-pages), or just a visual sidebar that lists features *of this module*?
   - *Assumption*: Based on "have its own independent sidebar", I will create a `SelfConsumptionSidebar` or integrate a sidebar layout inside `SelfConsumption/index.tsx`.

## Open Question for User (Mental Check)
The user said: "这个页面有PV Self-Consumption Analysis自己独立的侧边栏".
Does this mean:
A. The module has sub-pages (e.g. "Data Input", "Report", "History")?
B. The sidebar is just a navigation anchor for the long scrolling page (e.g. "Project Config", "Load Data", "PV System", "Results")?

Given the current single-page design, **Option B (Anchor Navigation)** or a simple "Module Sidebar" (with maybe "Back to Home" and "Current Analysis") seems most appropriate unless the user wants to expand functionality.

## Refactor Steps
1. **Modify App.tsx**:
   - Exclude `view === 'self-consumption'` from the shared `<Sidebar />`.
   - Ensure `SelfConsumption` component occupies full height/width.
2. **Modify SelfConsumption/index.tsx**:
   - Implement a layout: `Flex Row`.
   - Left: New `<SelfConsumptionSidebar />`.
   - Right: Main content area.
3. **Create SelfConsumptionSidebar**:
   - Items: "Analysis Home" (active), maybe "History" (future), "Back to Portal".

