import type { HourlyData, TimeConfig, TimeType } from '../types';
import type { MonthlyConsumption } from '../types/analysis';
import { resolveTimeConfigForMonthAndDayKind } from '../utils/timeConfigResolver';
import {
  hourKeyToMonthDayHour,
  toChinaHourKeyFromIsoUtc,
  toHourKeyFromMonthDayHour,
  toIsoLocalFromMonthDayHour,
} from '../utils/timeKey';

const BASE_YEAR = 2021;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const TOU_TYPES: TimeType[] = ['tip', 'peak', 'flat', 'valley', 'deep'];

export type DayType = 'workday' | 'restday' | 'holiday';
export type LoadLevel = 'A' | 'B' | 'C' | 'D';
export type WorkPattern = '双休' | '单休' | '无休';

export interface WorkSchedule {
  /** Default: 'abcd' (legacy). 'persona' uses 24h share curve to distribute monthly total. */
  loadModel?: 'abcd' | 'persona';
  workStartHour: number;
  workEndHour: number;
  workPattern: WorkPattern;
  R_B: number;
  R_C: number;
  R_D?: number;
  holidays?: string[];

  /** Persona curve (24 values), used when loadModel='persona' */
  weekday_shares?: number[];
  /** Optional weekend override (24 values); if omitted, weekend uses weekday_shares */
  weekend_shares?: number[];
}

export type PVSource =
  | { type: 'pvgis'; hourlyData: HourlyData[] }
  | { type: 'pv-excel'; pvWhPerKwpByTimeKey: Map<string, number>; pvCapacityKwp: number };

export interface CalculateAlignedConsumptionInput {
  provinceName: string;
  timeConfigs: TimeConfig[];
  monthlyConsumption: MonthlyConsumption[];
  pvSource: PVSource;
  workSchedule: WorkSchedule;
}

export interface MonthlyBasePower {
  P_work_A: number;
  P_work_B: number;
  P_work_C: number;
  P_work_D?: number;
}

export interface HourlyAlignedRow {
  timeKey: string;
  timeIsoLocal: string;
  month: number;
  day: number;
  hour: number;
  dayType: DayType;
  level: LoadLevel;
  touType: TimeType;
  loadKwh: number;
  pvKwh: number;
  selfKwh: number;
  gridExportKwh: number;
  gridImportKwh: number;
}

export interface MonthlyAlignedAggregate {
  month: number;
  pvGeneration: number;
  estimatedLoad: number;
  selfConsumption: number;
  gridExport: number;
  gridImport: number;
}

export interface AlignedKPIs {
  totalPVGeneration: number;
  totalEstimatedLoad: number;
  totalSelfConsumption: number;
  totalGridExport: number;
  totalGridImport: number;
  selfConsumptionRate: number;
  selfSufficiencyRate: number;
}

export interface TouAggregate {
  touType: TimeType;
  pvKwh: number;
  loadKwh: number;
  selfKwh: number;
  gridExportKwh: number;
  gridImportKwh: number;
}

export interface AlignedConsumptionResult {
  hourly: HourlyAlignedRow[];
  monthly: MonthlyAlignedAggregate[];
  kpis: AlignedKPIs;
  monthlyBasePower: Record<number, MonthlyBasePower>;
  touTotals: Record<TimeType, TouAggregate>;
  warnings: string[];
}

export function getWeekdayUtc(baseYear: number, month: number, day: number): number {
  return new Date(Date.UTC(baseYear, month - 1, day)).getUTCDay();
}

export function getDayType(params: {
  baseYear: number;
  month: number;
  day: number;
  workPattern: WorkPattern;
  holidays?: string[];
}): DayType {
  const { baseYear, month, day, workPattern, holidays = [] } = params;

  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  if (holidays.includes(mmdd)) {
    return 'holiday';
  }

  if (workPattern === '无休') {
    return 'workday';
  }

  const weekday = getWeekdayUtc(baseYear, month, day);
  if (workPattern === '单休') {
    return weekday === 0 ? 'restday' : 'workday';
  }

  return weekday === 0 || weekday === 6 ? 'restday' : 'workday';
}

export function getLevel(params: {
  dayType: DayType;
  hour: number;
  workStartHour: number;
  workEndHour: number;
}): LoadLevel {
  if (params.dayType === 'holiday') {
    return 'D';
  }
  if (params.dayType === 'restday') {
    return 'C';
  }
  if (params.hour >= params.workStartHour && params.hour < params.workEndHour) {
    return 'A';
  }
  return 'B';
}

export function solveMonthlyBasePower(params: {
  totalEnergyKwh: number;
  N_A: number;
  N_B: number;
  N_C: number;
  N_D?: number;
  R_B: number;
  R_C: number;
  R_D?: number;
}): { P_work_A: number; P_work_B: number; P_work_C: number; P_work_D?: number } {
  const N_D = params.N_D ?? 0;
  const R_D = params.R_D ?? 0;
  
  const totalWeightedHours = params.N_A + params.R_B * params.N_B + params.R_C * params.N_C + R_D * N_D;
  const P_work_A_raw = totalWeightedHours > 0 ? params.totalEnergyKwh / totalWeightedHours : 0;
  const P_work_A = Number.isFinite(P_work_A_raw) ? P_work_A_raw : 0;
  
  const result: { P_work_A: number; P_work_B: number; P_work_C: number; P_work_D?: number } = {
    P_work_A,
    P_work_B: P_work_A * params.R_B,
    P_work_C: P_work_A * params.R_C,
  };
  
  if (N_D > 0) {
    result.P_work_D = P_work_A * R_D;
  }
  
  return result;
}

function buildCanonicalHours(): Array<{ month: number; day: number; hour: number; timeKey: string; timeIsoLocal: string }> {
  const result: Array<{ month: number; day: number; hour: number; timeKey: string; timeIsoLocal: string }> = [];
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= DAYS_IN_MONTH[month - 1]; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const timeKey = toHourKeyFromMonthDayHour(month, day, hour);
        const timeIsoLocal = toIsoLocalFromMonthDayHour(BASE_YEAR, month, day, hour);
        result.push({ month, day, hour, timeKey, timeIsoLocal });
      }
    }
  }
  return result;
}

function buildTouGridByMonth(params: {
  timeConfigs: TimeConfig[];
  provinceName: string;
  warnings: string[];
}): Record<number, { weekday: TimeType[]; weekend: TimeType[] }> {
  const candidateYears = params.timeConfigs
    .filter((config) => config.config_type === 'monthly' && !config._deleted)
    .filter((config) => config.province === params.provinceName || config.province === '全部')
    .map((config) => config.year)
    .filter((year) => Number.isFinite(year));

  const defaultYear = candidateYears.length > 0 ? Math.max(...candidateYears) : new Date().getFullYear();

  const grids: Record<number, { weekday: TimeType[]; weekend: TimeType[] }> = {};
  for (let month = 1; month <= 12; month++) {
    const weekdayResolved = resolveTimeConfigForMonthAndDayKind(
      params.timeConfigs,
      params.provinceName,
      month,
      'weekday',
      defaultYear,
    );
    const weekendResolved = resolveTimeConfigForMonthAndDayKind(
      params.timeConfigs,
      params.provinceName,
      month,
      'weekend',
      defaultYear,
    );

    if (!weekdayResolved || !weekendResolved) {
      params.warnings.push(`未找到省份="${params.provinceName}" 的分时规则(TimeConfig)，月份=${month}。将该月全部小时按“平(Flat)”处理。`);
      grids[month] = {
        weekday: new Array(24).fill('flat') as TimeType[],
        weekend: new Array(24).fill('flat') as TimeType[],
      };
      continue;
    }

    grids[month] = {
      weekday: weekdayResolved.touGrid as TimeType[],
      weekend: weekendResolved.touGrid as TimeType[],
    };
  }
  return grids;
}

function normalizeShares24(raw: number[] | undefined): number[] {
  if (!Array.isArray(raw) || raw.length !== 24) {
    return new Array(24).fill(1 / 24);
  }
  let sum = 0;
  for (const v of raw) {
    if (Number.isFinite(v) && v > 0) sum += v;
  }
  if (sum <= 0) return new Array(24).fill(1 / 24);
  return raw.map((v) => (Number.isFinite(v) && v > 0 ? v / sum : 0));
}

function buildPvgisPvKwhByTimeKey(params: {
  hourlyData: HourlyData[];
  canonicalKeySet: Set<string>;
  warnings: string[];
}): Map<string, number> {
  const pvByKey = new Map<string, number>();
  let dropped = 0;
  let nonZeroCount = 0;

  for (const item of params.hourlyData) {
    const key = toChinaHourKeyFromIsoUtc(item.time);
    if (!params.canonicalKeySet.has(key)) {
      dropped += 1;
      continue;
    }
    const pvKwh = item.pvPower > 0 ? item.pvPower / 1000 : 0;
    if (pvKwh > 0) nonZeroCount += 1;
    pvByKey.set(key, (pvByKey.get(key) ?? 0) + pvKwh);
  }

  if (dropped > 0) {
    params.warnings.push(`PVGIS 逐时数据包含 ${dropped} 个超出标准年(8760)范围的小时（例如 02-29 闰日）。已按 8760 标准年对齐规则丢弃。`);
  }
  if (params.hourlyData.length > 0 && nonZeroCount === 0) {
    params.warnings.push('逐时光伏出力全为 0。若使用 PVGIS，通常表示该接口未返回 PV 功率字段 P（或解析失败）。');
  }
  return pvByKey;
}

function buildMonthlyConsumptionByMonth(monthlyConsumption: MonthlyConsumption[]): Map<number, MonthlyConsumption> {
  const map = new Map<number, MonthlyConsumption>();
  for (const c of monthlyConsumption) {
    map.set(c.month, c);
  }
  return map;
}

function sumMonthlyEnergyKwh(c: MonthlyConsumption | undefined): number {
  if (!c) return 0;
  const values = [c.tip, c.peak, c.flat, c.valley, c.deep];
  let sum = 0;
  for (const v of values) {
    if (Number.isFinite(v)) {
      sum += v;
    }
  }
  return sum;
}

function addTouConsistencyWarnings(params: {
  month: number;
  daysInMonth: number;
  touGrid: TimeType[];
  consumption: MonthlyConsumption | undefined;
  warnings: string[];
}) {
  const hoursPerType = new Map<TimeType, number>();
  for (const t of TOU_TYPES) {
    hoursPerType.set(t, 0);
  }

  for (let hour = 0; hour < 24; hour++) {
    const t = params.touGrid[hour] as TimeType;
    hoursPerType.set(t, (hoursPerType.get(t) ?? 0) + params.daysInMonth);
  }

  for (const t of TOU_TYPES) {
    const hours = hoursPerType.get(t) ?? 0;
    const kwh = params.consumption ? params.consumption[t] : 0;
    const validKwh = Number.isFinite(kwh) ? kwh : 0;

    if (validKwh > 0 && hours === 0) {
      params.warnings.push(`数据不匹配：月份=${params.month}，负荷中 touType="${t}" 电量 > 0，但 TimeConfig 中该类型小时数为 0。`);
    }
    if (hours > 0 && (!Number.isFinite(kwh) || validKwh === 0)) {
      params.warnings.push(`数据不匹配：月份=${params.month}，TimeConfig 定义了 touType="${t}"，但负荷电量为 0 或无效。`);
    }
  }
}

export function calculateAlignedConsumption(input: CalculateAlignedConsumptionInput): AlignedConsumptionResult {
  const warnings: string[] = [];
  const canonicalHours = buildCanonicalHours();
  const canonicalKeySet = new Set(canonicalHours.map((h) => h.timeKey));
  const touGridByMonth = buildTouGridByMonth({
    timeConfigs: input.timeConfigs,
    provinceName: input.provinceName,
    warnings,
  });
  const consumptionByMonth = buildMonthlyConsumptionByMonth(input.monthlyConsumption);

  const loadModel = input.workSchedule.loadModel ?? 'abcd';
  const personaWeekdayShares = normalizeShares24(input.workSchedule.weekday_shares);
  const personaWeekendShares = normalizeShares24(input.workSchedule.weekend_shares ?? input.workSchedule.weekday_shares);

  const pvByKey =
    input.pvSource.type === 'pvgis'
      ? buildPvgisPvKwhByTimeKey({
          hourlyData: input.pvSource.hourlyData,
          canonicalKeySet,
          warnings,
        })
      : null;

  const monthlyBasePower: Record<number, MonthlyBasePower> = {};

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = DAYS_IN_MONTH[month - 1];
    const touGrid = (touGridByMonth[month]?.weekday ?? (new Array(24).fill('flat') as TimeType[]));
    const monthConsumption = consumptionByMonth.get(month);

    if (loadModel === 'abcd') {
      addTouConsistencyWarnings({
        month,
        daysInMonth,
        touGrid,
        consumption: monthConsumption,
        warnings,
      });
    }

    let N_A = 0;
    let N_B = 0;
    let N_C = 0;
    let N_D = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayType = getDayType({
        baseYear: BASE_YEAR,
        month,
        day,
        workPattern: input.workSchedule.workPattern,
        holidays: input.workSchedule.holidays,
      });
      for (let hour = 0; hour < 24; hour++) {
        const level = getLevel({
          dayType,
          hour,
          workStartHour: input.workSchedule.workStartHour,
          workEndHour: input.workSchedule.workEndHour,
        });
        if (level === 'A') N_A += 1;
        else if (level === 'B') N_B += 1;
        else if (level === 'C') N_C += 1;
        else N_D += 1;
      }
    }

    const totalEnergyKwh = sumMonthlyEnergyKwh(monthConsumption);
    const solved = solveMonthlyBasePower({
      totalEnergyKwh,
      N_A,
      N_B,
      N_C,
      N_D,
      R_B: input.workSchedule.R_B,
      R_C: input.workSchedule.R_C,
      R_D: input.workSchedule.R_D,
    });

    monthlyBasePower[month] = solved;
  }

  const touTotals: Record<TimeType, TouAggregate> = {
    tip: { touType: 'tip', pvKwh: 0, loadKwh: 0, selfKwh: 0, gridExportKwh: 0, gridImportKwh: 0 },
    peak: { touType: 'peak', pvKwh: 0, loadKwh: 0, selfKwh: 0, gridExportKwh: 0, gridImportKwh: 0 },
    flat: { touType: 'flat', pvKwh: 0, loadKwh: 0, selfKwh: 0, gridExportKwh: 0, gridImportKwh: 0 },
    valley: { touType: 'valley', pvKwh: 0, loadKwh: 0, selfKwh: 0, gridExportKwh: 0, gridImportKwh: 0 },
    deep: { touType: 'deep', pvKwh: 0, loadKwh: 0, selfKwh: 0, gridExportKwh: 0, gridImportKwh: 0 },
  };

  const monthlyAgg: MonthlyAlignedAggregate[] = [];
  for (let m = 1; m <= 12; m++) {
    monthlyAgg.push({ month: m, pvGeneration: 0, estimatedLoad: 0, selfConsumption: 0, gridExport: 0, gridImport: 0 });
  }

  const hourly: HourlyAlignedRow[] = [];
  let totalPVGeneration = 0;
  let totalEstimatedLoad = 0;
  let totalSelfConsumption = 0;
  let totalGridExport = 0;
  let totalGridImport = 0;

  for (const h of canonicalHours) {
    const dayType = getDayType({
      baseYear: BASE_YEAR,
      month: h.month,
      day: h.day,
      workPattern: input.workSchedule.workPattern,
      holidays: input.workSchedule.holidays,
    });

    const dayKind = dayType === 'workday' ? 'weekday' : 'weekend';
    const touGrid = touGridByMonth[h.month]?.[dayKind] ?? (new Array(24).fill('flat') as TimeType[]);
    const touType = (touGrid[h.hour] ?? 'flat') as TimeType;

    const level = getLevel({
      dayType,
      hour: h.hour,
      workStartHour: input.workSchedule.workStartHour,
      workEndHour: input.workSchedule.workEndHour,
    });

    let loadKwh = 0;
    if (loadModel === 'persona') {
      const monthConsumption = consumptionByMonth.get(h.month);
      const totalEnergyKwh = sumMonthlyEnergyKwh(monthConsumption);
      const daysInMonth = DAYS_IN_MONTH[h.month - 1] ?? 0;
      const dailyTotalKwh = daysInMonth > 0 ? totalEnergyKwh / daysInMonth : 0;
      const shares = dayKind === 'weekend' ? personaWeekendShares : personaWeekdayShares;
      loadKwh = dailyTotalKwh * (shares[h.hour] ?? 0);
    } else {
      const basePower = monthlyBasePower[h.month] ?? { P_work_A: 0, P_work_B: 0, P_work_C: 0, P_work_D: 0 };
      loadKwh = level === 'A'
        ? basePower.P_work_A
        : level === 'B'
          ? basePower.P_work_B
          : level === 'C'
            ? basePower.P_work_C
            : (basePower.P_work_D ?? 0);
    }

    let pvKwh = 0;
    if (input.pvSource.type === 'pvgis') {
      pvKwh = pvByKey?.get(h.timeKey) ?? 0;
    } else {
      const whPerKwp = input.pvSource.pvWhPerKwpByTimeKey.get(h.timeKey) ?? 0;
      const validWh = Number.isFinite(whPerKwp) && whPerKwp > 0 ? whPerKwp : 0;
      pvKwh = (validWh / 1000) * input.pvSource.pvCapacityKwp;
    }

    const selfKwh = Math.min(loadKwh, pvKwh);
    const gridExportKwh = Math.max(0, pvKwh - loadKwh);
    const gridImportKwh = Math.max(0, loadKwh - pvKwh);

    hourly.push({
      timeKey: h.timeKey,
      timeIsoLocal: h.timeIsoLocal,
      month: h.month,
      day: h.day,
      hour: h.hour,
      dayType,
      level,
      touType,
      loadKwh,
      pvKwh,
      selfKwh,
      gridExportKwh,
      gridImportKwh,
    });

    const agg = monthlyAgg[h.month - 1];
    agg.pvGeneration += pvKwh;
    agg.estimatedLoad += loadKwh;
    agg.selfConsumption += selfKwh;
    agg.gridExport += gridExportKwh;
    agg.gridImport += gridImportKwh;

    totalPVGeneration += pvKwh;
    totalEstimatedLoad += loadKwh;
    totalSelfConsumption += selfKwh;
    totalGridExport += gridExportKwh;
    totalGridImport += gridImportKwh;

    const t = touTotals[touType];
    t.pvKwh += pvKwh;
    t.loadKwh += loadKwh;
    t.selfKwh += selfKwh;
    t.gridExportKwh += gridExportKwh;
    t.gridImportKwh += gridImportKwh;
  }

  const kpis: AlignedKPIs = {
    totalPVGeneration,
    totalEstimatedLoad,
    totalSelfConsumption,
    totalGridExport,
    totalGridImport,
    selfConsumptionRate: totalPVGeneration > 0 ? totalSelfConsumption / totalPVGeneration : 0,
    selfSufficiencyRate: totalEstimatedLoad > 0 ? totalSelfConsumption / totalEstimatedLoad : 0,
  };

  return {
    hourly,
    monthly: monthlyAgg,
    kpis,
    monthlyBasePower,
    touTotals,
    warnings,
  };
}
