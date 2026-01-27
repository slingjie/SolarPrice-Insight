import { TimeConfig, TimeType } from '../types';
import {
  MonthlyConsumption,
  HourlyLoad,
  HourlyPV,
  SelfConsumptionMetrics,
  LoadSynthesisError,
  TOUType,
} from '../types/analysis';
import { rulesToGrid } from './timeUtils';

const TOU_TYPES: TOUType[] = ['tip', 'peak', 'flat', 'valley', 'deep'];

export function getDaysInMonth(month: number, year?: number): number {
  const y = year ?? new Date().getFullYear();
  return new Date(y, month, 0).getDate();
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function countHoursPerTypeInMonth(
  month: number,
  year: number,
  hourlyTypeGrid: TimeType[]
): Map<TOUType, number> {
  const days = getDaysInMonth(month, year);
  const counts = new Map<TOUType, number>();

  TOU_TYPES.forEach((type) => counts.set(type, 0));

  for (let day = 1; day <= days; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const type = hourlyTypeGrid[hour] as TOUType;
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
  }

  return counts;
}

function formatTimestamp(year: number, month: number, day: number, hour: number): string {
  const m = month.toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  const h = hour.toString().padStart(2, '0');
  return `${year}-${m}-${d}T${h}:00:00`;
}

export function synthesizeLoadCurve(
  consumption: MonthlyConsumption[],
  timeConfig: TimeConfig,
  year?: number
): HourlyLoad[] {
  if (consumption.length === 0) {
    throw new LoadSynthesisError('Consumption array is empty');
  }

  const y = year ?? new Date().getFullYear();
  const hourlyTypeGrid = rulesToGrid(timeConfig.time_rules);
  const consumptionByMonth = new Map<number, MonthlyConsumption>();
  consumption.forEach((c) => consumptionByMonth.set(c.month, c));

  const result: HourlyLoad[] = [];

  for (let month = 1; month <= 12; month++) {
    const monthConsumption = consumptionByMonth.get(month);
    const hoursPerType = countHoursPerTypeInMonth(month, y, hourlyTypeGrid);
    const hourlyKwByType = new Map<TOUType, number>();

    for (const type of TOU_TYPES) {
      const totalHours = hoursPerType.get(type) ?? 0;
      const consumptionForType = monthConsumption ? monthConsumption[type] : 0;

      if (consumptionForType > 0 && totalHours === 0) {
        throw new LoadSynthesisError(
          `Month ${month} has consumption of ${consumptionForType} kWh for type "${type}", ` +
            `but no hours configured for type "${type}" in the time config.`
        );
      }

      const hourlyKw = totalHours > 0 ? consumptionForType / totalHours : 0;
      hourlyKwByType.set(type, hourlyKw);
    }

    const daysInMonth = getDaysInMonth(month, y);

    for (let day = 1; day <= daysInMonth; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const type = hourlyTypeGrid[hour] as TOUType;
        const loadKw = hourlyKwByType.get(type) ?? 0;

        result.push({
          time: formatTimestamp(y, month, day, hour),
          loadKw,
          type,
        });
      }
    }
  }

  return result;
}

export function calculateBalance(
  loadCurve: HourlyLoad[],
  pvCurve: HourlyPV[]
): SelfConsumptionMetrics {
  if (loadCurve.length === 0 || pvCurve.length === 0) {
    return {
      selfConsumptionKwh: 0,
      gridFeedInKwh: 0,
      gridDrawKwh: 0,
      totalLoadKwh: 0,
      totalPvKwh: 0,
      selfConsumptionRate: 0,
      selfSufficiencyRate: 0,
    };
  }

  const pvByTime = new Map<string, number>();
  pvCurve.forEach((pv) => pvByTime.set(pv.time, pv.pvKw));

  let selfConsumptionKwh = 0;
  let gridFeedInKwh = 0;
  let gridDrawKwh = 0;
  let totalLoadKwh = 0;
  let totalPvKwh = 0;

  for (const load of loadCurve) {
    const pvKw = pvByTime.get(load.time) ?? 0;
    const loadKw = load.loadKw;

    totalLoadKwh += loadKw;
    totalPvKwh += pvKw;

    const selfConsumed = Math.min(pvKw, loadKw);
    selfConsumptionKwh += selfConsumed;

    if (pvKw > loadKw) {
      gridFeedInKwh += pvKw - loadKw;
    } else {
      gridDrawKwh += loadKw - pvKw;
    }
  }

  const selfConsumptionRate = totalPvKwh > 0 ? selfConsumptionKwh / totalPvKwh : 0;
  const selfSufficiencyRate = totalLoadKwh > 0 ? selfConsumptionKwh / totalLoadKwh : 0;

  return {
    selfConsumptionKwh,
    gridFeedInKwh,
    gridDrawKwh,
    totalLoadKwh,
    totalPvKwh,
    selfConsumptionRate,
    selfSufficiencyRate,
  };
}
