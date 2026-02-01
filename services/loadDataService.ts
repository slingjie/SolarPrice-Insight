import * as XLSX from 'xlsx';
import {
  LoadProfileConfig,
  MonthlyLoadData,
  HourlyLoadData,
  ParsedLoadData,
  DEFAULT_LOAD_PROFILE_CONFIG,
} from '../types';

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const HOURS_IN_YEAR = 8760;

function isWeekend(dayOfYear: number): boolean {
  const date = new Date(2024, 0, 1);
  date.setDate(date.getDate() + dayOfYear);
  const dow = date.getDay();
  return dow === 0 || dow === 6;
}

function getMonthFromDayOfYear(dayOfYear: number): number {
  let cumDays = 0;
  for (let m = 0; m < 12; m++) {
    cumDays += DAYS_IN_MONTH[m];
    if (dayOfYear < cumDays) return m + 1;
  }
  return 12;
}

function getSeasonMultiplier(month: number, config: LoadProfileConfig): number {
  if (config.summerMonths.includes(month)) return config.summerMultiplier;
  if (config.winterMonths.includes(month)) return config.winterMultiplier;
  return 1.0;
}

function generateWorkdayHourlyCurve(config: LoadProfileConfig): number[] {
  const curve: number[] = new Array(24).fill(0);
  const workHours = config.workdayEnd - config.workdayStart;
  const nonWorkHours = 24 - workHours;

  for (let h = 0; h < 24; h++) {
    if (h >= config.workdayStart && h < config.workdayEnd) {
      curve[h] = config.workdayRatio / workHours;
    } else {
      curve[h] = (1 - config.workdayRatio) / nonWorkHours;
    }
  }
  return curve;
}

function generateHolidayHourlyCurve(): number[] {
  return new Array(24).fill(1 / 24);
}

export function parseExcelFile(file: File): Promise<ParsedLoadData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

        const result = detectAndParseData(jsonData);
        resolve(result);
      } catch (error) {
        reject(new Error(`Excel解析失败: ${error instanceof Error ? error.message : '未知错误'}`));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
}

function detectAndParseData(rows: unknown[][]): ParsedLoadData {
  const dataRows = rows.filter(row => row.length > 0 && row.some(cell => typeof cell === 'number'));

  if (dataRows.length === 0) {
    throw new Error('未找到有效数据');
  }

  if (dataRows.length >= 8000) {
    return parseHourlyData(dataRows);
  }

  const firstRow = rows[0];
  const hasTimeColumn = firstRow?.some(cell =>
    typeof cell === 'string' && /\d{1,2}:\d{2}/.test(cell)
  );

  if (hasTimeColumn) {
    return parseHourlyData(dataRows);
  }

  if (isHorizontalMonthlyFormat(rows)) {
    return parseHorizontalMonthlyData(rows);
  }

  return parseVerticalMonthlyData(dataRows);
}

const MONTH_NAMES: Record<string, number> = {
  'jan': 1, 'january': 1, '1月': 1, '一月': 1,
  'feb': 2, 'february': 2, '2月': 2, '二月': 2,
  'mar': 3, 'march': 3, '3月': 3, '三月': 3,
  'apr': 4, 'april': 4, '4月': 4, '四月': 4,
  'may': 5, '5月': 5, '五月': 5,
  'jun': 6, 'june': 6, '6月': 6, '六月': 6,
  'jul': 7, 'july': 7, '7月': 7, '七月': 7,
  'aug': 8, 'august': 8, '8月': 8, '八月': 8,
  'sep': 9, 'september': 9, '9月': 9, '九月': 9,
  'oct': 10, 'october': 10, '10月': 10, '十月': 10,
  'nov': 11, 'november': 11, '11月': 11, '十一月': 11,
  'dec': 12, 'december': 12, '12月': 12, '十二月': 12,
};

function parseMonthName(value: unknown): number | null {
  if (typeof value === 'number' && value >= 1 && value <= 12) {
    return Math.floor(value);
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (MONTH_NAMES[lower]) return MONTH_NAMES[lower];
    const match = lower.match(/^(\d{1,2})月?$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 12) return num;
    }
  }
  return null;
}

function isHorizontalMonthlyFormat(rows: unknown[][]): boolean {
  if (rows.length < 2) return false;
  const headerRow = rows[0];
  if (!headerRow || headerRow.length < 12) return false;

  let monthCount = 0;
  for (const cell of headerRow) {
    if (parseMonthName(cell) !== null) monthCount++;
  }
  return monthCount >= 10;
}

function parseHorizontalMonthlyData(rows: unknown[][]): ParsedLoadData {
  const headerRow = rows[0];
  const monthColumns: Map<number, number> = new Map();

  for (let col = 0; col < headerRow.length; col++) {
    const month = parseMonthName(headerRow[col]);
    if (month !== null) {
      monthColumns.set(col, month);
    }
  }

  if (monthColumns.size < 10) {
    throw new Error('无法识别月份表头');
  }

  const monthlyTotals: Map<number, number> = new Map();
  for (let m = 1; m <= 12; m++) {
    monthlyTotals.set(m, 0);
  }

  for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    if (!row) continue;

    for (const [col, month] of monthColumns) {
      const value = row[col];
      if (typeof value === 'number' && !isNaN(value)) {
        monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + value);
      }
    }
  }

  const monthly: MonthlyLoadData[] = [];
  let total = 0;

  for (let m = 1; m <= 12; m++) {
    const consumption = monthlyTotals.get(m) || 0;
    monthly.push({ month: m, consumption });
    total += consumption;
  }

  return {
    format: 'monthly',
    monthly,
    totalAnnual: total,
  };
}

function parseVerticalMonthlyData(rows: unknown[][]): ParsedLoadData {
  const monthly: MonthlyLoadData[] = [];
  let total = 0;

  for (const row of rows) {
    let monthVal: number | null = null;
    let consumptionVal: number | null = null;

    for (const cell of row) {
      if (monthVal === null) {
        const parsed = parseMonthName(cell);
        if (parsed !== null) {
          monthVal = parsed;
          continue;
        }
      }
      if (typeof cell === 'number' && consumptionVal === null && cell > 12) {
        consumptionVal = cell;
      }
    }

    if (monthVal !== null && consumptionVal !== null) {
      monthly.push({ month: monthVal, consumption: consumptionVal });
      total += consumptionVal;
    }
  }

  if (monthly.length === 0) {
    throw new Error('未找到有效的月度用电数据。请确保 Excel 文件包含月份列和用电量列。');
  }

  if (monthly.length < 12) {
    const existingMonths = new Set(monthly.map(m => m.month));
    const avgConsumption = total / monthly.length;
    for (let m = 1; m <= 12; m++) {
      if (!existingMonths.has(m)) {
        monthly.push({ month: m, consumption: avgConsumption });
        total += avgConsumption;
      }
    }
  }

  monthly.sort((a, b) => a.month - b.month);

  return {
    format: 'monthly',
    monthly,
    totalAnnual: total,
  };
}

function parseHourlyData(rows: unknown[][]): ParsedLoadData {
  const hourly: HourlyLoadData[] = [];
  let total = 0;

  for (const row of rows) {
    let timeVal: string | null = null;
    let loadVal: number | null = null;

    for (const cell of row) {
      if (typeof cell === 'string' && /\d/.test(cell) && timeVal === null) {
        timeVal = cell;
      } else if (typeof cell === 'number' && loadVal === null) {
        loadVal = cell;
      }
    }

    if (timeVal !== null && loadVal !== null) {
      hourly.push({ time: timeVal, load: loadVal });
      total += loadVal;
    }
  }

  if (hourly.length < 100) {
    throw new Error('逐时数据行数不足，请检查文件格式');
  }

  return {
    format: 'hourly',
    hourly,
    totalAnnual: total,
  };
}

/**
 * @deprecated Use `services/consumptionAlignedService.ts` (aligned 8760 engine) instead.
 */
export function generateHourlyLoadFromMonthly(
  monthly: MonthlyLoadData[],
  config: LoadProfileConfig = DEFAULT_LOAD_PROFILE_CONFIG
): HourlyLoadData[] {
  const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  const isDev = !!env?.DEV && env?.MODE !== 'test';
  if (isDev) {
    console.warn('[loadDataService] generateHourlyLoadFromMonthly is deprecated; use consumptionAlignedService instead.');
  }
  const hourlyData: HourlyLoadData[] = [];

  const monthlyMap = new Map<number, number>();
  for (const m of monthly) {
    monthlyMap.set(m.month, m.consumption);
  }

  const workdayCurve = generateWorkdayHourlyCurve(config);
  const holidayCurve = generateHolidayHourlyCurve();

  let dayOfYear = 0;

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = DAYS_IN_MONTH[month - 1];
    const monthlyConsumption = monthlyMap.get(month) || 0;
    const seasonMultiplier = getSeasonMultiplier(month, config);
    const adjustedMonthly = monthlyConsumption * seasonMultiplier;

    let workdayCount = 0;
    let holidayCount = 0;

    for (let d = 0; d < daysInMonth; d++) {
      const isHoliday = config.weekendAsHoliday && isWeekend(dayOfYear + d);
      if (isHoliday) holidayCount++;
      else workdayCount++;
    }

    const effectiveDays = workdayCount + holidayCount * config.holidayRatio;
    const dailyBaseLoad = adjustedMonthly / effectiveDays;

    for (let d = 0; d < daysInMonth; d++) {
      const isHoliday = config.weekendAsHoliday && isWeekend(dayOfYear + d);
      const dailyLoad = isHoliday ? dailyBaseLoad * config.holidayRatio : dailyBaseLoad;
      const hourlyCurve = isHoliday ? holidayCurve : workdayCurve;

      const dayStr = String(d + 1).padStart(2, '0');
      const monthStr = String(month).padStart(2, '0');

      for (let h = 0; h < 24; h++) {
        const hourLoad = dailyLoad * hourlyCurve[h];
        const hourStr = String(h).padStart(2, '0');
        hourlyData.push({
          time: `${monthStr}-${dayStr} ${hourStr}:00`,
          load: hourLoad,
        });
      }
    }

    dayOfYear += daysInMonth;
  }

  return hourlyData;
}

export function previewDailyLoadCurve(
  dailyConsumption: number,
  config: LoadProfileConfig,
  isHoliday: boolean = false
): { hour: number; load: number }[] {
  const curve = isHoliday ? generateHolidayHourlyCurve() : generateWorkdayHourlyCurve(config);
  return curve.map((ratio, hour) => ({
    hour,
    load: dailyConsumption * ratio,
  }));
}

export const loadDataService = {
  parseExcelFile,
  generateHourlyLoadFromMonthly,
  previewDailyLoadCurve,
};
