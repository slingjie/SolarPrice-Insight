# hourly-export learnings

- Excel CSV encoding: for non-ASCII (e.g., Chinese headers), Excel may mis-detect UTF-8 unless the file includes a UTF-8 BOM. We prepend `\uFEFF` to exported CSV.
  - Reference: https://support.microsoft.com/zh-cn/office/%E5%9C%A8-excel-%E4%B8%AD%E6%AD%A3%E7%A1%AE%E6%89%93%E5%BC%80-csv-utf-8-%E6%96%87%E4%BB%B6-8a935af5-3416-4edd-ba7e-3dfd2bc4a032

- UX: clipboard-first export (via `navigator.clipboard.writeText`) is a nice default for quick paste into Excel/Sheets; keep a download fallback for browsers/environments where clipboard permissions are blocked.
