import * as XLSX from 'xlsx';
import type { TariffData, TimeConfig, ComprehensiveResult, LoadPersona, TimeRule, TimeType } from '../types';
import { gridToRules } from './timeUtils';

export type ImportCategory = 'tariffs' | 'configs' | 'results' | 'personas';

const LABEL_TO_TYPE: Record<string, TimeType> = {
  '尖': 'tip', '峰': 'peak', '平': 'flat', '谷': 'valley', '深': 'deep',
};

const HOUR_HEADERS = Array.from({ length: 24 }, (_, i) => `${i}-${i + 1}`);

const COLUMN_TO_TIME_TYPE: Record<string, TimeType> = {
  '尖峰时段': 'tip', '高峰时段': 'peak', '平段时段': 'flat', '低谷时段': 'valley', '深谷时段': 'deep',
};

const parseRangesForType = (str: string, type: TimeType): TimeRule[] => {
  if (!str || !str.trim()) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean).map(range => {
    const dash = range.indexOf('-', 1);
    if (dash === -1) return null;
    return { start: range.slice(0, dash), end: range.slice(dash + 1), type };
  }).filter((r): r is TimeRule => r !== null);
};

const columnsToTimeRules = (row: Record<string, unknown>, prefix = ''): TimeRule[] => {
  const rules: TimeRule[] = [];
  for (const [col, type] of Object.entries(COLUMN_TO_TIME_TYPE)) {
    rules.push(...parseRangesForType(toStr(row[prefix + col]), type));
  }
  return rules;
};

const toNum = (v: unknown): number => {
  if (typeof v === 'number') return v;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

const toStr = (v: unknown): string => {
  if (v == null) return '';
  return String(v);
};

const idOrNew = (v: unknown): string => toStr(v) || crypto.randomUUID();

const excelSerialToIso = (serial: number): string | null => {
  if (!Number.isFinite(serial)) return null;
  // Excel serial date (1900 system): day 1 = 1900-01-01.
  // Use 1899-12-30 as epoch to match Excel behavior.
  const ms = Math.round((serial - 25569) * 86400 * 1000);
  const dt = new Date(ms);
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
};

const tsOrNow = (v: unknown): string => {
  if (v == null || toStr(v).trim() === '') return new Date().toISOString();

  if (typeof v === 'number' && Number.isFinite(v)) {
    const asExcel = excelSerialToIso(v);
    if (asExcel) return asExcel;
    const dt = new Date(v);
    if (!Number.isNaN(dt.getTime())) return dt.toISOString();
    return new Date().toISOString();
  }

  if (v instanceof Date) {
    if (!Number.isNaN(v.getTime())) return v.toISOString();
    return new Date().toISOString();
  }

  const s = toStr(v).trim();
  if (!s) return new Date().toISOString();

  const n = Number(s);
  if (!Number.isNaN(n) && Number.isFinite(n)) {
    const asExcel = excelSerialToIso(n);
    if (asExcel) return asExcel;
  }

  const dt = new Date(s);
  if (!Number.isNaN(dt.getTime())) return dt.toISOString();

  return new Date().toISOString();
};

const parseSpecialDateRange = (raw: string): { start?: string; end?: string } => {
  const matches = raw.match(/\d{4}-\d{2}-\d{2}/g) ?? [];
  if (matches.length === 0) return {};
  if (matches.length === 1) return { start: matches[0] };
  const [a, b] = matches;
  return a <= b ? { start: a, end: b } : { start: b, end: a };
};

const rowToTariff = (row: Record<string, unknown>): TariffData => ({
  id: idOrNew(row['ID']),
  province: toStr(row['省份']),
  city: toStr(row['城市']) || null,
  month: toStr(row['月份']),
  category: toStr(row['用电类别']),
  voltage_level: toStr(row['电压等级']),
  prices: {
    tip: toNum(row['尖峰价(元/kWh)']),
    peak: toNum(row['高峰价(元/kWh)']),
    flat: toNum(row['平段价(元/kWh)']),
    valley: toNum(row['低谷价(元/kWh)']),
    deep: row['深谷价(元/kWh)'] != null && toStr(row['深谷价(元/kWh)']) !== ''
      ? toNum(row['深谷价(元/kWh)'])
      : undefined,
  },
  time_rules: columnsToTimeRules(row),
  currency_unit: toStr(row['货币单位']) || 'CNY',
  created_at: tsOrNow(row['创建时间']),
  last_modified: tsOrNow(row['最后修改']),
});

const rowToConfig = (row: Record<string, unknown>): TimeConfig => {
  const specialRaw = toStr(row['特殊日期']).trim();
  const specialRange = parseSpecialDateRange(specialRaw);
  const isSpecial = Boolean(specialRange.start);
  const parsedYear = Number.parseInt(toStr(row['年份']), 10);
  const fallbackYear = isSpecial && specialRange.start
    ? Number.parseInt(specialRange.start.slice(0, 4), 10)
    : new Date().getFullYear();

  return {
    id: idOrNew(row['ID']),
    province: toStr(row['省份']),
    year: Number.isFinite(parsedYear) ? parsedYear : fallbackYear,
    config_type: isSpecial ? 'special_date' : 'monthly',
    month_pattern: isSpecial ? 'Special' : toStr(row['月份模式']),
    special_date: specialRange.start,
    special_date_end: specialRange.end,
    time_rules: columnsToTimeRules(row),
    updated_at: tsOrNow(row['更新时间']),
    last_modified: tsOrNow(row['最后修改']),
  };
};

const rowToResult = (row: Record<string, unknown>): ComprehensiveResult => ({
  id: idOrNew(row['ID']),
  province: toStr(row['省份']),
  category: toStr(row['用电类别']),
  voltage_level: toStr(row['电压等级']),
  avg_price: toNum(row['均价(元/kWh)']),
  months: toStr(row['覆盖月份']).split(',').filter(Boolean),
  start_time: toStr(row['开始时间']),
  end_time: toStr(row['结束时间']),
  last_modified: tsOrNow(row['最后修改']),
});

const rowToPersona = (row: Record<string, unknown>): LoadPersona => ({
  id: idOrNew(row['ID']),
  slug: toStr(row['标识']),
  name: toStr(row['名称']),
  isDefault: toStr(row['是否默认']) === '是',
  weekday_shares: toStr(row['工作日24点占比']).split(',').map(Number),
  weekend_shares: toStr(row['周末24点占比'])
    ? toStr(row['周末24点占比']).split(',').map(Number)
    : undefined,
  updated_at: tsOrNow(row['更新时间']),
  last_modified: tsOrNow(row['最后修改']),
});

const converters: Record<ImportCategory, (row: Record<string, unknown>) => unknown> = {
  tariffs: rowToTariff,
  configs: rowToConfig,
  results: rowToResult,
  personas: rowToPersona,
};

const isRowNonEmpty = (row: Record<string, unknown>): boolean =>
  Object.values(row).some(v => v != null && String(v).trim() !== '');

const rowValidators: Record<ImportCategory, (row: Record<string, unknown>) => boolean> = {
  tariffs: (row) => Boolean(toStr(row['省份']).trim()),
  configs: (row) => Boolean(toStr(row['省份']).trim()),
  results: (row) => Boolean(toStr(row['省份']).trim()),
  personas: (row) => Boolean(toStr(row['名称']).trim()),
};

const isMatrixSheet = (sheet: XLSX.WorkSheet): boolean => {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { range: 0 });
  if (rows.length === 0) return false;
  const keys = Object.keys(rows[0]);
  return HOUR_HEADERS.slice(0, 3).every(h => keys.includes(h));
};

const parseMatrixConfigs = (wb: XLSX.WorkBook): TimeConfig[] => {
  const configs: TimeConfig[] = [];
  const now = new Date().toISOString();

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    const gridsByYear = new Map<number, Map<number, TimeType[]>>();

    for (const row of rows) {
      const year = Number.parseInt(String(row['year'] ?? row['Year'] ?? ''), 10) || new Date().getFullYear();
      const month = Number(row['Month']);
      if (!month || month < 1 || month > 12) continue;

      const grid: TimeType[] = [];
      for (let h = 0; h < 24; h++) {
        const label = String(row[HOUR_HEADERS[h]] ?? '平').trim();
        grid.push(LABEL_TO_TYPE[label] ?? 'flat');
      }

      if (!gridsByYear.has(year)) {
        gridsByYear.set(year, new Map<number, TimeType[]>());
      }
      gridsByYear.get(year)!.set(month, grid);
    }

    for (const [year, gridsPerMonth] of gridsByYear.entries()) {
      const gridSignatures = new Map<string, number[]>();
      for (const [month, grid] of gridsPerMonth) {
        const sig = grid.join(',');
        const existing = gridSignatures.get(sig);
        if (existing) {
          existing.push(month);
        } else {
          gridSignatures.set(sig, [month]);
        }
      }

      for (const [sig, months] of gridSignatures) {
        const grid = sig.split(',') as TimeType[];
        const isAll = months.length === 12;
        const monthPattern = isAll ? 'All' : months.sort((a, b) => a - b).join(',');

        if (!monthPattern) continue;

        configs.push({
          id: crypto.randomUUID(),
          province: sheetName,
          year,
          config_type: 'monthly',
          month_pattern: monthPattern,
          time_rules: gridToRules(grid),
          updated_at: now,
          last_modified: now,
        });
      }
    }
  }

  return configs;
};

export const parseSpreadsheetFile = async (
  file: File,
  category: ImportCategory,
): Promise<unknown[]> => {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer);

  if (category === 'configs' && wb.SheetNames.length > 0) {
    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    if (firstSheet && isMatrixSheet(firstSheet)) {
      return parseMatrixConfigs(wb);
    }
  }

  const firstSheet = wb.Sheets[wb.SheetNames[0]];
  if (!firstSheet) throw new Error('文件中没有找到工作表');

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);
  if (rows.length === 0) throw new Error('工作表中没有数据行');

  const convert = converters[category];
  const isValid = rowValidators[category];
  return rows.filter(isRowNonEmpty).filter(isValid).map(convert);
};

export const isSpreadsheetFile = (filename: string): boolean => {
  const lower = filename.toLowerCase();
  return lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv');
};
