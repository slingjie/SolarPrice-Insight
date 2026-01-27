import * as XLSX from 'xlsx';
import { MonthlyConsumption, ExcelParseError } from '../types/analysis';

type TOUField = 'tip' | 'peak' | 'flat' | 'valley' | 'deep';

const HEADER_PATTERNS: Record<TOUField | 'month', RegExp[]> = {
  month: [/^月份?$/i, /^month$/i, /^\d+月?$/],
  tip: [/^尖峰?$/i, /^tip$/i, /^尖时$/i],
  peak: [/^峰$/i, /^高峰$/i, /^peak$/i],
  flat: [/^平$/i, /^平段?$/i, /^flat$/i],
  valley: [/^谷$/i, /^低谷$/i, /^valley$/i],
  deep: [/^深谷$/i, /^deep$/i, /^深$/i],
};

function normalizeHeader(header: string): string {
  return String(header).trim().toLowerCase();
}

function matchHeaderToField(header: string): TOUField | 'month' | null {
  const normalized = normalizeHeader(header);
  for (const [field, patterns] of Object.entries(HEADER_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized) || pattern.test(header.trim())) {
        return field as TOUField | 'month';
      }
    }
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
