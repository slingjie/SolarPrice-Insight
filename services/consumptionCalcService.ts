import {
  HourlyLoadData,
  HourlyConsumptionResult,
  MonthlyConsumptionData,
  ConsumptionSummary,
  HourlyData,
} from '../types';

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function parseTimeToMonthDayHour(timeStr: string): { month: number; day: number; hour: number } | null {
  const isoMatch = timeStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2})/);
  if (isoMatch) {
    return {
      month: parseInt(isoMatch[2], 10),
      day: parseInt(isoMatch[3], 10),
      hour: parseInt(isoMatch[4], 10),
    };
  }

  const mdHMatch = timeStr.match(/(\d{1,2})-(\d{1,2})\s+(\d{1,2}):/);
  if (mdHMatch) {
    return {
      month: parseInt(mdHMatch[1], 10),
      day: parseInt(mdHMatch[2], 10),
      hour: parseInt(mdHMatch[3], 10),
    };
  }

  return null;
}

function convertUtcToChina(utcTimeStr: string): string {
  const parsed = parseTimeToMonthDayHour(utcTimeStr);
  if (!parsed) return utcTimeStr;

  let { month, day, hour } = parsed;
  hour += 8;

  if (hour >= 24) {
    hour -= 24;
    day += 1;

    if (day > DAYS_IN_MONTH[month - 1]) {
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
      }
    }
  }

  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const hourStr = String(hour).padStart(2, '0');

  return `${monthStr}-${dayStr} ${hourStr}:00`;
}

function generateTimeKey(month: number, day: number, hour: number): string {
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:00`;
}

function buildLoadMap(loadData: HourlyLoadData[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const item of loadData) {
    const parsed = parseTimeToMonthDayHour(item.time);
    if (parsed) {
      const key = generateTimeKey(parsed.month, parsed.day, parsed.hour);
      map.set(key, (map.get(key) || 0) + item.load);
    }
  }

  return map;
}

function buildPvMap(pvData: HourlyData[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const item of pvData) {
    const chinaTime = convertUtcToChina(item.time);
    const parsed = parseTimeToMonthDayHour(chinaTime);
    if (parsed) {
      const key = generateTimeKey(parsed.month, parsed.day, parsed.hour);
      const pvKwh = item.pvPower / 1000;
      map.set(key, (map.get(key) || 0) + pvKwh);
    }
  }

  return map;
}

export function calculateConsumption(
  pvData: HourlyData[],
  loadData: HourlyLoadData[]
): ConsumptionSummary {
  const pvMap = buildPvMap(pvData);
  const loadMap = buildLoadMap(loadData);

  const hourlyResults: HourlyConsumptionResult[] = [];
  const monthlyAgg: Map<number, {
    pv: number; load: number; self: number; export: number; import: number;
  }> = new Map();

  for (let m = 1; m <= 12; m++) {
    monthlyAgg.set(m, { pv: 0, load: 0, self: 0, export: 0, import: 0 });
  }

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = DAYS_IN_MONTH[month - 1];

    for (let day = 1; day <= daysInMonth; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const timeKey = generateTimeKey(month, day, hour);

        const pvGeneration = pvMap.get(timeKey) || 0;
        const loadDemand = loadMap.get(timeKey) || 0;

        const selfConsumption = Math.min(pvGeneration, loadDemand);
        const gridExport = Math.max(0, pvGeneration - loadDemand);
        const gridImport = Math.max(0, loadDemand - pvGeneration);

        hourlyResults.push({
          time: timeKey,
          pvGeneration,
          loadDemand,
          selfConsumption,
          gridExport,
          gridImport,
        });

        const agg = monthlyAgg.get(month)!;
        agg.pv += pvGeneration;
        agg.load += loadDemand;
        agg.self += selfConsumption;
        agg.export += gridExport;
        agg.import += gridImport;
      }
    }
  }

  const monthlyData: MonthlyConsumptionData[] = [];
  let totalPv = 0, totalLoad = 0, totalSelf = 0, totalExport = 0, totalImport = 0;

  for (let month = 1; month <= 12; month++) {
    const agg = monthlyAgg.get(month)!;
    totalPv += agg.pv;
    totalLoad += agg.load;
    totalSelf += agg.self;
    totalExport += agg.export;
    totalImport += agg.import;

    monthlyData.push({
      month,
      pvGeneration: agg.pv,
      loadDemand: agg.load,
      selfConsumption: agg.self,
      gridExport: agg.export,
      gridImport: agg.import,
      selfConsumptionRate: agg.pv > 0 ? agg.self / agg.pv : 0,
      selfSufficiencyRate: agg.load > 0 ? agg.self / agg.load : 0,
    });
  }

  return {
    totalPvGeneration: totalPv,
    totalLoadDemand: totalLoad,
    totalSelfConsumption: totalSelf,
    totalGridExport: totalExport,
    totalGridImport: totalImport,
    selfConsumptionRate: totalPv > 0 ? totalSelf / totalPv : 0,
    selfSufficiencyRate: totalLoad > 0 ? totalSelf / totalLoad : 0,
    hourlyData: hourlyResults,
    monthlyData,
  };
}

export function getTypicalDayData(
  summary: ConsumptionSummary,
  month: number,
  day: number
): HourlyConsumptionResult[] {
  const targetPrefix = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return summary.hourlyData.filter(h => h.time.startsWith(targetPrefix));
}

export function aggregateHourlyAverage(
  summary: ConsumptionSummary
): { hour: number; avgPv: number; avgLoad: number; avgSelf: number }[] {
  const hourlySum = new Array(24).fill(null).map(() => ({
    pv: 0, load: 0, self: 0, count: 0,
  }));

  for (const h of summary.hourlyData) {
    const parsed = parseTimeToMonthDayHour(h.time);
    if (parsed) {
      const idx = parsed.hour;
      hourlySum[idx].pv += h.pvGeneration;
      hourlySum[idx].load += h.loadDemand;
      hourlySum[idx].self += h.selfConsumption;
      hourlySum[idx].count += 1;
    }
  }

  return hourlySum.map((s, hour) => ({
    hour,
    avgPv: s.count > 0 ? s.pv / s.count : 0,
    avgLoad: s.count > 0 ? s.load / s.count : 0,
    avgSelf: s.count > 0 ? s.self / s.count : 0,
  }));
}

export const consumptionCalcService = {
  calculateConsumption,
  getTypicalDayData,
  aggregateHourlyAverage,
};
