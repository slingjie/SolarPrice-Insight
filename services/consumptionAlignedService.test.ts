import { describe, it, expect } from 'vitest';
import {
  calculateAlignedConsumption,
  getDayType,
  getWeekdayUtc,
  getLevel,
  solveMonthlyBasePower,
  type WorkPattern,
} from './consumptionAlignedService';
import type { TimeConfig, TimeType } from '../types';
import type { MonthlyConsumption } from '../types/analysis';

function createMonthlyConsumption(month: number, values: Partial<MonthlyConsumption> = {}): MonthlyConsumption {
  return {
    month,
    tip: 0,
    peak: 0,
    flat: 0,
    valley: 0,
    deep: 0,
    ...values,
  };
}

function createAllFlatTimeConfig(options: {
  id: string;
  province: string;
  monthPattern: string;
  lastModified: string;
}): TimeConfig {
  return {
    id: options.id,
    province: options.province,
    month_pattern: options.monthPattern,
    time_rules: [{ start: '00:00', end: '24:00', type: 'flat' as TimeType }],
    updated_at: options.lastModified,
    last_modified: options.lastModified,
  };
}

function createAllDayTouTimeConfig(options: {
  id: string;
  province: string;
  monthPattern: string;
  lastModified: string;
  weekdayType: TimeType;
  weekendType?: TimeType;
}): TimeConfig {
  return {
    id: options.id,
    province: options.province,
    month_pattern: options.monthPattern,
    time_rules: [{ start: '00:00', end: '24:00', type: options.weekdayType }],
    ...(options.weekendType ? { weekend_time_rules: [{ start: '00:00', end: '24:00', type: options.weekendType }] } : {}),
    updated_at: options.lastModified,
    last_modified: options.lastModified,
  };
}

describe('consumptionAlignedService', () => {
  describe('getDayType with holidays', () => {
    it('returns "holiday" when date is in holiday list', () => {
      const holidays = ['01-01', '10-01'];
      const result = getDayType({ baseYear: 2021, month: 1, day: 1, workPattern: '双休', holidays });
      expect(result).toBe('holiday');
    });

    it('holiday has higher priority than weekend', () => {
      const holidays = ['01-02']; // 2021-01-02 is Saturday
      const result = getDayType({ baseYear: 2021, month: 1, day: 2, workPattern: '双休', holidays });
      expect(result).toBe('holiday'); // not 'restday'
    });

    it('returns "restday" when weekend but not a holiday', () => {
      const holidays = ['01-01'];
      const result = getDayType({ baseYear: 2021, month: 1, day: 2, workPattern: '双休', holidays }); // Saturday
      expect(result).toBe('restday');
    });

    it('returns "workday" when weekday and not a holiday', () => {
      const holidays = ['01-01'];
      const result = getDayType({ baseYear: 2021, month: 1, day: 4, workPattern: '双休', holidays }); // Monday
      expect(result).toBe('workday');
    });

    it('handles empty holidays list', () => {
      const result = getDayType({ baseYear: 2021, month: 1, day: 1, workPattern: '双休', holidays: [] });
      expect(result).toBe('workday');
    });
  });

  describe('solveMonthlyBasePower', () => {
    it('solves P_work_A/B/C from golden fixture', () => {
      const result = solveMonthlyBasePower({
        totalEnergyKwh: 360,
        N_A: 2,
        N_B: 2,
        N_C: 2,
        R_B: 0.5,
        R_C: 0.25,
      });

      expect(result.P_work_A).toBeCloseTo(360 / 3.5, 7);
      expect(result.P_work_B).toBeCloseTo((360 / 3.5) * 0.5, 7);
      expect(result.P_work_C).toBeCloseTo((360 / 3.5) * 0.25, 7);
    });

    it('calculates with N_D (holidays)', () => {
      const result = solveMonthlyBasePower({
        totalEnergyKwh: 400,
        N_A: 2,
        N_B: 2,
        N_C: 2,
        N_D: 2,
        R_B: 0.5,
        R_C: 0.25,
        R_D: 0.2,
      });

      // totalWeightedHours = 2 + 0.5*2 + 0.25*2 + 0.2*2 = 2 + 1 + 0.5 + 0.4 = 3.9
      // P_work_A = 400 / 3.9 = 102.564...
      expect(result.P_work_A).toBeCloseTo(400 / 3.9, 7);
      expect(result.P_work_B).toBeCloseTo((400 / 3.9) * 0.5, 7);
      expect(result.P_work_C).toBeCloseTo((400 / 3.9) * 0.25, 7);
      expect(result.P_work_D).toBeCloseTo((400 / 3.9) * 0.2, 7);
    });
  });

  describe('getLevel with Level D', () => {
    it('returns "D" for holiday day type', () => {
      const result = getLevel({ dayType: 'holiday', hour: 10, workStartHour: 9, workEndHour: 18 });
      expect(result).toBe('D');
    });

    it('returns "D" for holiday regardless of hour', () => {
      const result1 = getLevel({ dayType: 'holiday', hour: 8, workStartHour: 9, workEndHour: 18 });
      const result2 = getLevel({ dayType: 'holiday', hour: 12, workStartHour: 9, workEndHour: 18 });
      const result3 = getLevel({ dayType: 'holiday', hour: 20, workStartHour: 9, workEndHour: 18 });
      expect(result1).toBe('D');
      expect(result2).toBe('D');
      expect(result3).toBe('D');
    });
  });

  describe('weekday determinism', () => {
    it('computes weekday via Date.UTC (baseYear=2021)', () => {
      expect(getWeekdayUtc(2021, 1, 2)).toBe(6); // Sat
      expect(getWeekdayUtc(2021, 1, 3)).toBe(0); // Sun
    });

    it('classifies rest days by workPattern', () => {
      const sat = { baseYear: 2021, month: 1, day: 2 };
      const sun = { baseYear: 2021, month: 1, day: 3 };

      expect(getDayType({ ...sat, workPattern: '双休' })).toBe('restday');
      expect(getDayType({ ...sun, workPattern: '双休' })).toBe('restday');

      expect(getDayType({ ...sat, workPattern: '单休' })).toBe('workday');
      expect(getDayType({ ...sun, workPattern: '单休' })).toBe('restday');

      expect(getDayType({ ...sat, workPattern: '无休' })).toBe('workday');
      expect(getDayType({ ...sun, workPattern: '无休' })).toBe('workday');
    });
  });

  describe('calculateAlignedConsumption', () => {
    it('produces 8760 hourly rows (baseYear=2021)', () => {
      const timeConfigs = [
        createAllFlatTimeConfig({
          id: 't1',
          province: '全部',
          monthPattern: 'All',
          lastModified: '2024-01-01T00:00:00Z',
        }),
      ];

      const consumption: MonthlyConsumption[] = [];
      for (let m = 1; m <= 12; m++) {
        consumption.push(createMonthlyConsumption(m));
      }

      const result = calculateAlignedConsumption({
        provinceName: '未知',
        timeConfigs,
        monthlyConsumption: consumption,
        pvSource: { type: 'pv-excel', pvWhPerKwpByTimeKey: new Map(), pvCapacityKwp: 10 },
        workSchedule: {
          workStartHour: 8,
          workEndHour: 18,
          workPattern: '双休',
          R_B: 0.5,
          R_C: 0.25,
        },
      });

      expect(result.hourly.length).toBe(8760);
      expect(result.monthly.length).toBe(12);
    });

    it('satisfies per-hour energy balance invariants', () => {
      const timeConfigs = [
        createAllFlatTimeConfig({
          id: 't1',
          province: '全部',
          monthPattern: 'All',
          lastModified: '2024-01-01T00:00:00Z',
        }),
      ];

      const consumption: MonthlyConsumption[] = [];
      for (let m = 1; m <= 12; m++) {
        consumption.push(createMonthlyConsumption(m, { flat: m === 1 ? 1000 : 0 }));
      }

      const pvWhPerKwpByTimeKey = new Map<string, number>();
      pvWhPerKwpByTimeKey.set('01-01 08:00', 500);
      pvWhPerKwpByTimeKey.set('01-01 09:00', 1000);

      const result = calculateAlignedConsumption({
        provinceName: '未知',
        timeConfigs,
        monthlyConsumption: consumption,
        pvSource: { type: 'pv-excel', pvWhPerKwpByTimeKey, pvCapacityKwp: 10 },
        workSchedule: {
          workStartHour: 8,
          workEndHour: 18,
          workPattern: '双休',
          R_B: 0.5,
          R_C: 0.25,
        },
      });

      for (const h of result.hourly) {
        expect(h.selfKwh + h.gridExportKwh).toBeCloseTo(h.pvKwh, 10);
        expect(h.selfKwh + h.gridImportKwh).toBeCloseTo(h.loadKwh, 10);
      }
    });

    it('uses weekend_time_rules touGrid for restday/holiday hours', () => {
      const timeConfigs = [
        createAllDayTouTimeConfig({
          id: 't1',
          province: '全部',
          monthPattern: 'All',
          lastModified: '2024-01-01T00:00:00Z',
          weekdayType: 'flat',
          weekendType: 'peak',
        }),
      ];

      const consumption: MonthlyConsumption[] = [];
      for (let m = 1; m <= 12; m++) {
        consumption.push(createMonthlyConsumption(m, { flat: m === 1 ? 1000 : 0 }));
      }

      const result = calculateAlignedConsumption({
        provinceName: '未知',
        timeConfigs,
        monthlyConsumption: consumption,
        pvSource: { type: 'pv-excel', pvWhPerKwpByTimeKey: new Map(), pvCapacityKwp: 10 },
        workSchedule: {
          workStartHour: 8,
          workEndHour: 18,
          workPattern: '双休',
          holidays: ['01-04'], // 2021-01-04 is Monday, force holiday -> weekend dayKind
          R_B: 0.5,
          R_C: 0.25,
        },
      });

      const sat = result.hourly.find((h) => h.timeKey === '01-02 00:00');
      const monHoliday = result.hourly.find((h) => h.timeKey === '01-04 00:00');
      const tue = result.hourly.find((h) => h.timeKey === '01-05 00:00');

      expect(sat).toBeTruthy();
      expect(monHoliday).toBeTruthy();
      expect(tue).toBeTruthy();

      expect(sat!.dayType).toBe('restday');
      expect(sat!.touType).toBe('peak');

      expect(monHoliday!.dayType).toBe('holiday');
      expect(monHoliday!.touType).toBe('peak');

      expect(tue!.dayType).toBe('workday');
      expect(tue!.touType).toBe('flat');
    });

    it('falls back to weekday rules when weekend_time_rules not provided', () => {
      const timeConfigs = [
        createAllDayTouTimeConfig({
          id: 't1',
          province: '全部',
          monthPattern: 'All',
          lastModified: '2024-01-01T00:00:00Z',
          weekdayType: 'valley',
        }),
      ];

      const consumption: MonthlyConsumption[] = [];
      for (let m = 1; m <= 12; m++) {
        consumption.push(createMonthlyConsumption(m, { flat: m === 1 ? 1000 : 0 }));
      }

      const result = calculateAlignedConsumption({
        provinceName: '未知',
        timeConfigs,
        monthlyConsumption: consumption,
        pvSource: { type: 'pv-excel', pvWhPerKwpByTimeKey: new Map(), pvCapacityKwp: 10 },
        workSchedule: {
          workStartHour: 8,
          workEndHour: 18,
          workPattern: '双休',
          R_B: 0.5,
          R_C: 0.25,
        },
      });

      const sat = result.hourly.find((h) => h.timeKey === '01-02 00:00');
      expect(sat).toBeTruthy();
      expect(sat!.dayType).toBe('restday');
      expect(sat!.touType).toBe('valley');
    });

    it('persona load model conserves monthly total energy and respects weekend_shares override', () => {
      const timeConfigs = [
        createAllFlatTimeConfig({
          id: 't1',
          province: '全部',
          monthPattern: 'All',
          lastModified: '2024-01-01T00:00:00Z',
        }),
      ];

      const totalJan = 310;
      const consumption: MonthlyConsumption[] = [];
      for (let m = 1; m <= 12; m++) {
        consumption.push(createMonthlyConsumption(m, { flat: m === 1 ? totalJan : 0 }));
      }

      const weekdayShares = new Array(24).fill(0);
      weekdayShares[0] = 1;
      const weekendShares = new Array(24).fill(0);
      weekendShares[1] = 1;

      const result = calculateAlignedConsumption({
        provinceName: '未知',
        timeConfigs,
        monthlyConsumption: consumption,
        pvSource: { type: 'pv-excel', pvWhPerKwpByTimeKey: new Map(), pvCapacityKwp: 10 },
        workSchedule: {
          loadModel: 'persona',
          weekday_shares: weekdayShares,
          weekend_shares: weekendShares,
          workStartHour: 8,
          workEndHour: 18,
          workPattern: '双休',
          R_B: 0.5,
          R_C: 0.25,
        },
      });

      const janLoad = result.hourly
        .filter((h) => h.month === 1)
        .reduce((sum, h) => sum + h.loadKwh, 0);
      expect(janLoad).toBeCloseTo(totalJan, 9);

      const sat00 = result.hourly.find((h) => h.timeKey === '01-02 00:00');
      const sat01 = result.hourly.find((h) => h.timeKey === '01-02 01:00');
      const tue00 = result.hourly.find((h) => h.timeKey === '01-05 00:00');
      const tue01 = result.hourly.find((h) => h.timeKey === '01-05 01:00');

      expect(sat00).toBeTruthy();
      expect(sat01).toBeTruthy();
      expect(tue00).toBeTruthy();
      expect(tue01).toBeTruthy();

      expect(sat00!.dayType).toBe('restday');
      expect(sat00!.loadKwh).toBeCloseTo(0, 12);
      expect(sat01!.loadKwh).toBeGreaterThan(0);

      expect(tue00!.dayType).toBe('workday');
      expect(tue00!.loadKwh).toBeGreaterThan(0);
      expect(tue01!.loadKwh).toBeCloseTo(0, 12);
    });
  });
});
