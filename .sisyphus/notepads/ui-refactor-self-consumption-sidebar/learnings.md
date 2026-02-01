
## UI/UX Improvements
- Implemented a dedicated "Focus Mode" for the Self-Consumption Analysis module.
- Replaced the global sidebar with a context-specific `AnalysisSidebar` to reduce distraction and provide relevant tools (New Analysis, History).
- Used a distinct color theme (Green/Emerald) for the analysis module to differentiate it from the main application (Blue).
- Added a clear "Back to Portal" navigation path.

## Code Patterns
- **Context-Specific Sidebars**: For complex modules like analysis or calculators, replacing the global navigation with a local one improves user focus.
- **Layout Control in App.tsx**: `App.tsx` acts as the layout controller, conditionally rendering the global sidebar based on the current view.
