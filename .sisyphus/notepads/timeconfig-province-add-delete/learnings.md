# Learnings - timeconfig-province-add-delete
- 2026-02-08: Observed that the province list must be a union of the preset `PROVINCES` and any configured entries so that custom entries remain visible without hijacking the order.
- 2026-02-08: Filtering should run against the merged list so both preset and dynamic provinces remain discoverable when users search or add new entries.
- 2026-02-08: Matrix brush interactions can be locked to the `title` text for each hour cell, and dragging relies on the grid container toggling `isDragging` while each cell still runs `handleCellClick` via `onMouseEnter`.
- 2026-02-08: Province creation now normalizes search input, blocks whitespace/duplicate names, auto-selects the trimmed value, and clears the search so new entries immediately open the matrix editor.
- 2026-02-08: Clearing a province now explicitly resets the selection when the removed province was active to keep the matrix data from referencing wiped configs.
- 2026-02-09: Component tests now cover the province add/duplicate/delete lifecycle, ensuring trimmed input triggers the editor and non-selected deletions keep focus.
- 2026-02-09: Verified via tests that the add button only appears for trimmed, unseen texts and that closing the selected province reveals the empty-state prompt while other deletions keep the editor alive.
- 2026-02-09: Playwright init hang traced to RxDB migration error (DM4 + schema additionalProperty "year"), which triggers DB wipe/retry and can make automation see repeated “初始化数据库中...”; clean origin loads immediately and UI is usable.
- 2026-02-09: Full test suite passes after aligning consumptionAlignedService weekend/holiday touType expectations with current monthly-only TimeConfig resolver.
