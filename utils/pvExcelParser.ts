/**
 * PV Excel Parser - 24x12 Format (Reference Repo Aligned)
 * 
 * Parses PV generation Excel files with 24 hour rows × 12 month columns.
 * Input unit: Wh/kWp (per-kW capacity, hourly energy).
 * Output: hour-key map for all 8760 hours (repeats monthly profile across all days).
 */

import * as XLSX from 'xlsx';
import { toHourKeyFromMonthDayHour } from './timeKey';

export interface PVExcelParseError extends Error {
  name: 'PVExcelParseError';
}

// Reuse month patterns from excelParser
const MONTH_PATTERNS: Record<number, RegExp[]> = {
  1: [/^1月?$/i, /^jan$/i, /^january$/i],
  2: [/^2月?$/i, /^feb$/i, /^february$/i],
  3: [/^3月?$/i, /^mar$/i, /^march$/i],
  4: [/^4月?$/i, /^apr$/i, /^april$/i],
  5: [/^5月?$/i, /^may$/i],
  6: [/^6月?$/i, /^jun$/i, /^june$/i],
  7: [/^7月?$/i, /^jul$/i, /^july$/i],
  8: [/^8月?$/i, /^aug$/i, /^august$/i],
  9: [/^9月?$/i, /^sep$/i, /^september$/i],
  10: [/^10月?$/i, /^oct$/i, /^october$/i],
  11: [/^11月?$/i, /^nov$/i, /^november$/i],
  12: [/^12月?$/i, /^dec$/i, /^december$/i],
};

function detectMonthNumber(header: string): number | null {
  const normalized = String(header).trim().toLowerCase();
  for (const [month, patterns] of Object.entries(MONTH_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return parseInt(month, 10);
      }
    }
  }
  const num = parseInt(normalized, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return num;
  }
  return null;
}

function parseHourLabel(label: string): number | null {
  // Accept formats: "0 - 1", "0-1", "23 - 24", etc.
  const match = String(label).trim().match(/^(\d+)\s*-\s*(\d+)$/);
  if (match) {
    const hourStart = parseInt(match[1], 10);
    if (hourStart >= 0 && hourStart <= 23) {
      return hourStart;
    }
  }
  return null;
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // baseYear=2021, non-leap

/**
 * Parse PV Excel file (24 rows × 12 columns).
 * Returns Map<TimeKey, Wh/kWp> for all 8760 hours (baseYear=2021).
 * 
 * @param file Excel file with PV generation data
 * @returns Map from TimeKey ("MM-DD HH:00") to Wh/kWp value
 */
export async function parsePVExcelFile(file: File | Buffer | ArrayBuffer): Promise<Map<string, number>> {
  let buffer: Buffer | ArrayBuffer;
  
  if (file instanceof ArrayBuffer || Buffer.isBuffer(file)) {
    buffer = file;
  } else {
    buffer = await file.arrayBuffer();
  }
  
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    const error = new Error('Excel file has no sheets') as PVExcelParseError;
    error.name = 'PVExcelParseError';
    throw error;
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (rawData.length < 2) {
    const error = new Error('Excel file must have header row + data rows') as PVExcelParseError;
    error.name = 'PVExcelParseError';
    throw error;
  }

  const headerRow = rawData[0] as unknown[];
  const dataRows = rawData.slice(1) as unknown[][];

  // Detect month columns (skip first column which is hour label)
  const monthColumns: { colIndex: number; month: number }[] = [];
  for (let col = 1; col < headerRow.length; col++) {
    const month = detectMonthNumber(String(headerRow[col]));
    if (month !== null) {
      monthColumns.push({ colIndex: col, month });
    }
  }

  if (monthColumns.length === 0) {
    const error = new Error('No valid month columns detected') as PVExcelParseError;
    error.name = 'PVExcelParseError';
    throw error;
  }

  if (dataRows.length !== 24) {
    const error = new Error(`Expected 24 hour rows, got ${dataRows.length}`) as PVExcelParseError;
    error.name = 'PVExcelParseError';
    throw error;
  }

  // Parse hour rows
  const hourlyByMonth: Map<number, Map<number, number>> = new Map(); // month → (hour → Wh/kWp)
  for (let rowIdx = 0; rowIdx < dataRows.length; rowIdx++) {
    const row = dataRows[rowIdx];
    const hourLabel = String(row[0] || '');
    const hour = parseHourLabel(hourLabel);
    if (hour === null) {
      const error = new Error(`Invalid hour label at row ${rowIdx + 2}: "${hourLabel}"`) as PVExcelParseError;
      error.name = 'PVExcelParseError';
      throw error;
    }

    for (const { colIndex, month } of monthColumns) {
      const value = parseFloat(String(row[colIndex] || '0'));
      if (!hourlyByMonth.has(month)) {
        hourlyByMonth.set(month, new Map());
      }
      hourlyByMonth.get(month)!.set(hour, isNaN(value) ? 0 : value);
    }
  }

  // Expand to 8760 hours (repeat monthly 24h profile across all days in month)
  const result = new Map<string, number>();
  for (let month = 1; month <= 12; month++) {
    const monthlyHours = hourlyByMonth.get(month);
    if (!monthlyHours) continue; // skip months not in Excel

    const daysInMonth = DAYS_IN_MONTH[month - 1];
    for (let day = 1; day <= daysInMonth; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const timeKey = toHourKeyFromMonthDayHour(month, day, hour);
        const whPerKwp = monthlyHours.get(hour) || 0;
        result.set(timeKey, whPerKwp);
      }
    }
  }

  return result;
}
