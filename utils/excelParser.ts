import * as XLSX from 'xlsx';
import { MonthlyConsumption, MonthlyTotalConsumption, ExcelParseError } from '../types/analysis';

type TOUField = 'tip' | 'peak' | 'flat' | 'valley' | 'deep';

const HEADER_PATTERNS: Record<TOUField | 'month' | 'tou', RegExp[]> = {
  month: [/^月份?$/i, /^month$/i, /^\d+月?$/],
  tou: [/^tou$/i, /^TOU$/i],
  tip: [/^尖峰?$/i, /^tip$/i, /^尖时$/i, /^尖$/i],
  peak: [/^峰$/i, /^高峰$/i, /^peak$/i],
  flat: [/^平$/i, /^平段?$/i, /^flat$/i],
  valley: [/^谷$/i, /^低谷$/i, /^valley$/i],
  deep: [/^深谷$/i, /^deep$/i, /^深$/i],
};

// Month name mappings for detection
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

function normalizeHeader(header: string): string {
  return String(header).trim().toLowerCase();
}

function matchHeaderToField(header: string): TOUField | 'month' | 'tou' | null {
  const normalized = normalizeHeader(header);
  for (const [field, patterns] of Object.entries(HEADER_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized) || pattern.test(header.trim())) {
        return field as TOUField | 'month' | 'tou';
      }
    }
  }
  return null;
}

function detectMonthNumber(header: string): number | null {
  const normalized = normalizeHeader(header);
  for (const [month, patterns] of Object.entries(MONTH_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized) || pattern.test(header.trim())) {
        return parseInt(month, 10);
      }
    }
  }
  // Also try parsing the header directly as a number (for numeric columns)
  const num = parseInt(String(header).trim(), 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return num;
  }
  return null;
}

function parseMonthValue(value: unknown): number {
  if (typeof value === 'number') {
    return Math.floor(value);
  }
  const str = String(value).trim();
  const match = str.match(/^(\d{1,2})月?$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  const num = parseInt(str, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return num;
  }
  return NaN;
}

function parseNumericValue(value: unknown): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  const str = String(value).trim().replace(/,/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function normalizeTouLabel(label: string): TOUField | null {
  const normalized = normalizeHeader(label);
  for (const [field, patterns] of Object.entries(HEADER_PATTERNS)) {
    if (field === 'month' || field === 'tou') continue;
    for (const pattern of patterns) {
      if (pattern.test(normalized) || pattern.test(label.trim())) {
        return field as TOUField;
      }
    }
  }
  return null;
}

function detectFormat(
  headers: string[],
  firstRow: Record<string, unknown>
): 'month-row' | 'tou-row' | null {
  // Check for month-row format: expects "月份" or "Month" column
  const monthField = headers.find((h) => matchHeaderToField(h) === 'month');
  if (monthField) {
    // Verify at least one TOU field exists
    const hasTouFields = headers.some((h) => {
      const field = matchHeaderToField(h);
      return field && (field === 'tip' || field === 'peak' || field === 'flat' || field === 'valley' || field === 'deep');
    });
    if (hasTouFields) {
      return 'month-row';
    }
  }

  // Check for tou-row format: expects "tou" column + month columns
  const touField = headers.find((h) => matchHeaderToField(h) === 'tou');
  if (touField) {
    // Check if first row's tou column contains a TOU label
    const touValue = String(firstRow[touField] || '').trim();
    const normalizedTou = normalizeTouLabel(touValue);
    if (normalizedTou) {
      // Verify at least one month column exists
      const hasMonthColumns = headers.some((h) => h !== touField && detectMonthNumber(h) !== null);
      if (hasMonthColumns) {
        return 'tou-row';
      }
    }
  }

  return null;
}

async function parseMonthRowFormat(
  rawData: Record<string, unknown>[],
  headers: string[]
): Promise<MonthlyConsumption[]> {
  const fieldMapping: Partial<Record<TOUField | 'month', string>> = {};

  for (const header of headers) {
    const field = matchHeaderToField(header);
    if (field && !fieldMapping[field]) {
      fieldMapping[field] = header;
    }
  }

  if (!fieldMapping.month) {
    throw new ExcelParseError('Missing required "月份" or "Month" column');
  }

  const results: MonthlyConsumption[] = [];

  for (const row of rawData) {
    const monthValue = parseMonthValue(row[fieldMapping.month!]);

    if (isNaN(monthValue) || monthValue < 1 || monthValue > 12) {
      continue;
    }

    const consumption: MonthlyConsumption = {
      month: monthValue,
      tip: parseNumericValue(fieldMapping.tip ? row[fieldMapping.tip] : 0),
      peak: parseNumericValue(fieldMapping.peak ? row[fieldMapping.peak] : 0),
      flat: parseNumericValue(fieldMapping.flat ? row[fieldMapping.flat] : 0),
      valley: parseNumericValue(fieldMapping.valley ? row[fieldMapping.valley] : 0),
      deep: parseNumericValue(fieldMapping.deep ? row[fieldMapping.deep] : 0),
    };

    results.push(consumption);
  }

  if (results.length === 0) {
    throw new ExcelParseError('No valid data rows found');
  }

  results.sort((a, b) => a.month - b.month);

  return results;
}

async function parseTouRowFormat(
  rawData: Record<string, unknown>[],
  headers: string[]
): Promise<MonthlyConsumption[]> {
  // Find the TOU column
  const touHeader = headers.find((h) => matchHeaderToField(h) === 'tou');
  if (!touHeader) {
    throw new ExcelParseError('Missing required "tou" column in TOU-row format');
  }

  // Find all month columns
  const monthColumns: Array<{ header: string; month: number }> = [];
  for (const header of headers) {
    if (header === touHeader) continue;
    const month = detectMonthNumber(header);
    if (month !== null) {
      monthColumns.push({ header, month });
    }
  }

  if (monthColumns.length === 0) {
    throw new ExcelParseError('No month columns found in TOU-row format');
  }

  // Sort by month for consistent ordering
  monthColumns.sort((a, b) => a.month - b.month);

  // Initialize result map for detected months only
  const monthMap: Record<number, MonthlyConsumption> = {};
  for (const { month } of monthColumns) {
    if (!monthMap[month]) {
      monthMap[month] = { month, tip: 0, peak: 0, flat: 0, valley: 0, deep: 0 };
    }
  }

  // Parse each TOU row
  for (const row of rawData) {
    const touValue = String(row[touHeader] || '').trim();
    const touField = normalizeTouLabel(touValue);

    if (!touField) {
      // Skip rows with invalid TOU labels
      continue;
    }

    // Extract consumption values for each month
    for (const { header, month } of monthColumns) {
      const value = parseNumericValue(row[header]);
      monthMap[month][touField] += value; // Accumulate in case of duplicates
    }
  }

  // Convert to sorted array
  const results = Object.values(monthMap).sort((a, b) => a.month - b.month);

  if (results.length === 0) {
    throw new ExcelParseError('No valid data rows found');
  }

  return results;
}

export async function parseConsumptionFile(file: File): Promise<MonthlyConsumption[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  if (workbook.SheetNames.length === 0) {
    throw new ExcelParseError('Excel file contains no sheets');
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  if (rawData.length === 0) {
    throw new ExcelParseError('Excel file contains no data rows');
  }

  const headers = Object.keys(rawData[0]);

  // Auto-detect format
  const format = detectFormat(headers, rawData[0]);

  if (format === 'month-row') {
    return parseMonthRowFormat(rawData, headers);
  } else if (format === 'tou-row') {
    return parseTouRowFormat(rawData, headers);
  } else {
    // Fallback to month-row for backward compatibility
    throw new ExcelParseError(
      'Unable to detect file format. Expected either month-row (月份 column with TOU fields) or tou-row (tou column with month columns)'
    );
  }
}

export type ParsedSelfConsumptionLoad =
  | { format: 'by-tou'; monthly: MonthlyConsumption[] }
  | { format: 'monthly-total'; monthly: MonthlyTotalConsumption[] };

const TOTAL_HEADER_PATTERNS: RegExp[] = [
  /^总电量$/i,
  /^总用电量$/i,
  /^用电量$/i,
  /^电量$/i,
  /^total$/i,
  /^consumption$/i,
  /^energy$/i,
  /^kwh$/i,
  /^月电量$/i,
];

function matchHeaderToTotal(header: string): boolean {
  const normalized = normalizeHeader(header);
  return TOTAL_HEADER_PATTERNS.some((p) => p.test(normalized) || p.test(header.trim()));
}

async function parseMonthlyTotalFile(file: File): Promise<MonthlyTotalConsumption[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  if (workbook.SheetNames.length === 0) {
    throw new ExcelParseError('Excel file contains no sheets');
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  if (rawData.length === 0) {
    throw new ExcelParseError('Excel file contains no data rows');
  }

  const headers = Object.keys(rawData[0]);
  const monthHeader = headers.find((h) => matchHeaderToField(h) === 'month');
  const totalHeader = headers.find((h) => matchHeaderToTotal(h));

  if (!monthHeader || !totalHeader) {
    throw new ExcelParseError('Missing required month/total columns');
  }

  const results: MonthlyTotalConsumption[] = [];
  for (const row of rawData) {
    const monthValue = parseMonthValue(row[monthHeader]);
    if (!Number.isFinite(monthValue) || monthValue < 1 || monthValue > 12) continue;

    const total = parseNumericValue(row[totalHeader]);
    results.push({ month: monthValue, total });
  }

  if (results.length === 0) {
    throw new ExcelParseError('No valid data rows found');
  }

  results.sort((a, b) => a.month - b.month);
  return results;
}

/**
 * For SelfConsumption module:
 * - Prefer monthly-by-TOU import (existing)
 * - Fallback to simplified monthly-total import (month + total kWh)
 */
export async function parseSelfConsumptionLoadFile(file: File): Promise<ParsedSelfConsumptionLoad> {
  try {
    const monthly = await parseConsumptionFile(file);
    return { format: 'by-tou', monthly };
  } catch (err) {
    // Fallback to monthly-total format
    const monthly = await parseMonthlyTotalFile(file);
    return { format: 'monthly-total', monthly };
  }
}
