import { describe, it, expect } from 'vitest';
import {
  synthesizeLoadCurve,
  calculateBalance,
  getDaysInMonth,
} from './loadSynthesizer';
import { MonthlyConsumption, LoadSynthesisError, HourlyPV, TOUType } from '../types/analysis';
import { TimeConfig, TimeType } from '../types';

function createTimeConfig(timeRules: { start: string; end: string; type: TimeType }[]): TimeConfig {
  return {
    id: 'test-config',
    province: 'test',
    month_pattern: 'All',
    time_rules: timeRules,
    updated_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  };
}

function createMonthlyConsumption(
  month: number,
  values: Partial<MonthlyConsumption> = {}
): MonthlyConsumption {
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

describe('getDaysInMonth', () => {
  it('returns correct days for regular months', () => {
    expect(getDaysInMonth(1, 2025)).toBe(31);
    expect(getDaysInMonth(3, 2025)).toBe(31);
    expect(getDaysInMonth(4, 2025)).toBe(30);
    expect(getDaysInMonth(6, 2025)).toBe(30);
    expect(getDaysInMonth(12, 2025)).toBe(31);
  });

  it('returns 28 for February in non-leap year', () => {
    expect(getDaysInMonth(2, 2023)).toBe(28);
    expect(getDaysInMonth(2, 2025)).toBe(28);
  });

  it('returns 29 for February in leap year', () => {
    expect(getDaysInMonth(2, 2024)).toBe(29);
    expect(getDaysInMonth(2, 2000)).toBe(29);
    expect(getDaysInMonth(2, 2100)).toBe(28);
  });

  it('uses current year when year is undefined', () => {
    const currentYear = new Date().getFullYear();
    const expected = getDaysInMonth(2, currentYear);
    expect(getDaysInMonth(2, undefined)).toBe(expected);
  });
});

describe('synthesizeLoadCurve', () => {
  describe('basic functionality', () => {
    it('generates 8760 hourly points for a full year (non-leap)', () => {
      const consumption = [createMonthlyConsumption(1, { flat: 100 })];
      const config = createTimeConfig([
        { start: '00:00', end: '24:00', type: 'flat' },
      ]);

      const result = synthesizeLoadCurve(consumption, config, 2025);
      expect(result.length).toBe(8760);
    });

    it('generates 8784 hourly points for a leap year', () => {
      const consumption = [createMonthlyConsumption(1, { flat: 100 })];
      const config = createTimeConfig([
        { start: '00:00', end: '24:00', type: 'flat' },
      ]);

      const result = synthesizeLoadCurve(consumption, config, 2024);
      expect(result.length).toBe(8784);
    });

    it('correctly assigns TOU type to each hour based on time config', () => {
      const consumption = [createMonthlyConsumption(1, { peak: 100, valley: 50 })];
      const config = createTimeConfig([
        { start: '08:00', end: '20:00', type: 'peak' },
        { start: '20:00', end: '08:00', type: 'valley' },
      ]);

      const result = synthesizeLoadCurve(consumption, config, 2025);

      // Hour 10 (10:00-11:00) should be peak
      const hour10 = result.find(r => r.time.includes('T10:00'));
      expect(hour10?.type).toBe('peak');

      // Hour 22 (22:00-23:00) should be valley
      const hour22 = result.find(r => r.time.includes('T22:00'));
      expect(hour22?.type).toBe('valley');
    });
  });

  describe('load distribution calculation', () => {
    it('distributes monthly kWh evenly across hours of same type', () => {
      // January has 31 days, 24 hours all flat = 744 hours
      // 744 kWh / 744 hours = 1 kW per hour
      const consumption = [createMonthlyConsumption(1, { flat: 744 })];
      const config = createTimeConfig([
        { start: '00:00', end: '24:00', type: 'flat' },
      ]);

      const result = synthesizeLoadCurve(consumption, config, 2025);
      const january = result.filter(r => r.time.startsWith('2025-01'));

      expect(january.length).toBe(744);
      expect(january[0].loadKw).toBeCloseTo(1, 5);
      expect(january[100].loadKw).toBeCloseTo(1, 5);
    });

    it('calculates correct hourly kW for peak/valley split', () => {
      // January: 31 days
      // Peak 08:00-20:00 = 12 hours/day = 372 hours
      // Valley 20:00-08:00 = 12 hours/day = 372 hours
      // Peak consumption: 372 kWh / 372 hours = 1 kW
      // Valley consumption: 186 kWh / 372 hours = 0.5 kW
      const consumption = [createMonthlyConsumption(1, { peak: 372, valley: 186 })];
      const config = createTimeConfig([
        { start: '08:00', end: '20:00', type: 'peak' },
        { start: '20:00', end: '08:00', type: 'valley' },
      ]);

      const result = synthesizeLoadCurve(consumption, config, 2025);
      const january = result.filter(r => r.time.startsWith('2025-01'));

      const peakHour = january.find(r => r.time.includes('T10:00'));
      const valleyHour = january.find(r => r.time.includes('T22:00'));

      expect(peakHour?.loadKw).toBeCloseTo(1, 5);
      expect(valleyHour?.loadKw).toBeCloseTo(0.5, 5);
    });

    it('handles multiple TOU types correctly', () => {
      // Simplified: 6 hours each type per day
      // tip: 00:00-06:00 (6h) -> 186 hours/month in Jan
      // peak: 06:00-12:00 (6h)
      // flat: 12:00-18:00 (6h)
      // valley: 18:00-00:00 (6h)
      const consumption = [
        createMonthlyConsumption(1, {
          tip: 186, // 186h * 1kW = 186 kWh
          peak: 372, // 186h * 2kW = 372 kWh
          flat: 558, // 186h * 3kW = 558 kWh
          valley: 744, // 186h * 4kW = 744 kWh
        }),
      ];
      const config = createTimeConfig([
        { start: '00:00', end: '06:00', type: 'tip' },
        { start: '06:00', end: '12:00', type: 'peak' },
        { start: '12:00', end: '18:00', type: 'flat' },
        { start: '18:00', end: '00:00', type: 'valley' },
      ]);

      const result = synthesizeLoadCurve(consumption, config, 2025);
      const january = result.filter(r => r.time.startsWith('2025-01'));

      const tipHour = january.find(r => r.time.includes('T03:00'));
      const peakHour = january.find(r => r.time.includes('T09:00'));
      const flatHour = january.find(r => r.time.includes('T15:00'));
      const valleyHour = january.find(r => r.time.includes('T21:00'));

      expect(tipHour?.loadKw).toBeCloseTo(1, 5);
      expect(peakHour?.loadKw).toBeCloseTo(2, 5);
      expect(flatHour?.loadKw).toBeCloseTo(3, 5);
      expect(valleyHour?.loadKw).toBeCloseTo(4, 5);
    });
  });

  describe('error handling', () => {
    it('throws LoadSynthesisError when consumption for a type has non-zero hours but 0 config hours', () => {
      // User says they consumed 100 kWh in "deep" period
      // But config has no "deep" hours -> division by zero situation
      const consumption = [createMonthlyConsumption(1, { deep: 100 })];
      const config = createTimeConfig([
        { start: '00:00', end: '24:00', type: 'flat' },
      ]);

      expect(() => synthesizeLoadCurve(consumption, config, 2025)).toThrow(
        LoadSynthesisError
      );
      expect(() => synthesizeLoadCurve(consumption, config, 2025)).toThrow(
        /no hours configured for type "deep"/i
      );
    });

    it('does NOT throw when consumption is 0 for a type with 0 hours', () => {
      const consumption = [createMonthlyConsumption(1, { flat: 100, deep: 0 })];
      const config = createTimeConfig([
        { start: '00:00', end: '24:00', type: 'flat' },
      ]);

      expect(() => synthesizeLoadCurve(consumption, config, 2025)).not.toThrow();
    });

    it('throws when consumption array is empty', () => {
      const config = createTimeConfig([
        { start: '00:00', end: '24:00', type: 'flat' },
      ]);

      expect(() => synthesizeLoadCurve([], config, 2025)).toThrow(
        LoadSynthesisError
      );
    });
  });

  describe('multi-month scenarios', () => {
    it('handles 12 months with different consumption values', () => {
      const consumption = Array.from({ length: 12 }, (_, i) =>
        createMonthlyConsumption(i + 1, { flat: (i + 1) * 100 })
      );
      const config = createTimeConfig([
        { start: '00:00', end: '24:00', type: 'flat' },
      ]);

      const result = synthesizeLoadCurve(consumption, config, 2025);
      expect(result.length).toBe(8760);

      // January (100 kWh) should have lower load than December (1200 kWh)
      const jan = result.filter(r => r.time.startsWith('2025-01'));
      const dec = result.filter(r => r.time.startsWith('2025-12'));

      const janAvgLoad = jan.reduce((sum, r) => sum + r.loadKw, 0) / jan.length;
      const decAvgLoad = dec.reduce((sum, r) => sum + r.loadKw, 0) / dec.length;

      expect(decAvgLoad).toBeGreaterThan(janAvgLoad);
    });

    it('handles February correctly in leap vs non-leap years', () => {
      const consumption = [createMonthlyConsumption(2, { flat: 672 })]; // 28 days * 24h = 672h
      const config = createTimeConfig([
        { start: '00:00', end: '24:00', type: 'flat' },
      ]);

      // Non-leap year (2025): Feb has 28 days = 672 hours
      const result2025 = synthesizeLoadCurve(consumption, config, 2025);
      const feb2025 = result2025.filter(r => r.time.startsWith('2025-02'));
      expect(feb2025.length).toBe(672);
      expect(feb2025[0].loadKw).toBeCloseTo(1, 5); // 672 kWh / 672h = 1 kW

      // Leap year (2024): Feb has 29 days = 696 hours
      // Same 672 kWh / 696h = 0.9655 kW
      const result2024 = synthesizeLoadCurve(consumption, config, 2024);
      const feb2024 = result2024.filter(r => r.time.startsWith('2024-02'));
      expect(feb2024.length).toBe(696);
      expect(feb2024[0].loadKw).toBeCloseTo(672 / 696, 4);
    });
  });

  describe('ISO timestamp format', () => {
    it('generates valid ISO 8601 timestamps', () => {
      const consumption = [createMonthlyConsumption(1, { flat: 100 })];
      const config = createTimeConfig([
        { start: '00:00', end: '24:00', type: 'flat' },
      ]);

      const result = synthesizeLoadCurve(consumption, config, 2025);

      expect(result[0].time).toBe('2025-01-01T00:00:00');
      expect(result[1].time).toBe('2025-01-01T01:00:00');
      expect(result[23].time).toBe('2025-01-01T23:00:00');
      expect(result[24].time).toBe('2025-01-02T00:00:00');
    });
  });
});

describe('calculateBalance', () => {
  function createHourlyPV(time: string, pvKw: number): HourlyPV {
    return { time, pvKw };
  }

  describe('basic balance calculation', () => {
    it('calculates self-consumption when PV equals load', () => {
      const loadCurve = [
        { time: '2025-01-01T10:00:00', loadKw: 5, type: 'peak' as TOUType },
        { time: '2025-01-01T11:00:00', loadKw: 5, type: 'peak' as TOUType },
      ];
      const pvCurve = [
        createHourlyPV('2025-01-01T10:00:00', 5),
        createHourlyPV('2025-01-01T11:00:00', 5),
      ];

      const result = calculateBalance(loadCurve, pvCurve);

      expect(result.selfConsumptionKwh).toBe(10);
      expect(result.gridFeedInKwh).toBe(0);
      expect(result.gridDrawKwh).toBe(0);
      expect(result.totalLoadKwh).toBe(10);
      expect(result.totalPvKwh).toBe(10);
      expect(result.selfConsumptionRate).toBe(1);
      expect(result.selfSufficiencyRate).toBe(1);
    });

    it('calculates grid feed-in when PV exceeds load', () => {
      const loadCurve = [
        { time: '2025-01-01T10:00:00', loadKw: 3, type: 'peak' as TOUType },
      ];
      const pvCurve = [createHourlyPV('2025-01-01T10:00:00', 10)];

      const result = calculateBalance(loadCurve, pvCurve);

      expect(result.selfConsumptionKwh).toBe(3);
      expect(result.gridFeedInKwh).toBe(7);
      expect(result.gridDrawKwh).toBe(0);
      expect(result.selfConsumptionRate).toBeCloseTo(0.3, 5);
      expect(result.selfSufficiencyRate).toBe(1);
    });

    it('calculates grid draw when load exceeds PV', () => {
      const loadCurve = [
        { time: '2025-01-01T10:00:00', loadKw: 10, type: 'peak' as TOUType },
      ];
      const pvCurve = [createHourlyPV('2025-01-01T10:00:00', 3)];

      const result = calculateBalance(loadCurve, pvCurve);

      expect(result.selfConsumptionKwh).toBe(3);
      expect(result.gridFeedInKwh).toBe(0);
      expect(result.gridDrawKwh).toBe(7);
      expect(result.selfConsumptionRate).toBe(1);
      expect(result.selfSufficiencyRate).toBeCloseTo(0.3, 5);
    });
  });

  describe('edge cases', () => {
    it('handles zero PV generation', () => {
      const loadCurve = [
        { time: '2025-01-01T10:00:00', loadKw: 5, type: 'peak' as TOUType },
      ];
      const pvCurve = [createHourlyPV('2025-01-01T10:00:00', 0)];

      const result = calculateBalance(loadCurve, pvCurve);

      expect(result.selfConsumptionKwh).toBe(0);
      expect(result.gridFeedInKwh).toBe(0);
      expect(result.gridDrawKwh).toBe(5);
      expect(result.selfConsumptionRate).toBe(0);
      expect(result.selfSufficiencyRate).toBe(0);
    });

    it('handles zero load', () => {
      const loadCurve = [
        { time: '2025-01-01T10:00:00', loadKw: 0, type: 'peak' as TOUType },
      ];
      const pvCurve = [createHourlyPV('2025-01-01T10:00:00', 5)];

      const result = calculateBalance(loadCurve, pvCurve);

      expect(result.selfConsumptionKwh).toBe(0);
      expect(result.gridFeedInKwh).toBe(5);
      expect(result.gridDrawKwh).toBe(0);
      expect(result.selfConsumptionRate).toBe(0);
      expect(result.selfSufficiencyRate).toBe(0);
    });

    it('handles both zero PV and zero load', () => {
      const loadCurve = [
        { time: '2025-01-01T10:00:00', loadKw: 0, type: 'peak' as TOUType },
      ];
      const pvCurve = [createHourlyPV('2025-01-01T10:00:00', 0)];

      const result = calculateBalance(loadCurve, pvCurve);

      expect(result.selfConsumptionKwh).toBe(0);
      expect(result.gridFeedInKwh).toBe(0);
      expect(result.gridDrawKwh).toBe(0);
      expect(result.selfConsumptionRate).toBe(0);
      expect(result.selfSufficiencyRate).toBe(0);
    });

    it('handles empty arrays', () => {
      const result = calculateBalance([], []);

      expect(result.selfConsumptionKwh).toBe(0);
      expect(result.gridFeedInKwh).toBe(0);
      expect(result.gridDrawKwh).toBe(0);
      expect(result.selfConsumptionRate).toBe(0);
      expect(result.selfSufficiencyRate).toBe(0);
    });
  });

  describe('realistic scenario', () => {
    it('handles mixed day with PV only during daytime', () => {
      const loadCurve = [
        { time: '2025-01-01T06:00:00', loadKw: 2, type: 'valley' as TOUType },
        { time: '2025-01-01T10:00:00', loadKw: 3, type: 'peak' as TOUType },
        { time: '2025-01-01T12:00:00', loadKw: 4, type: 'peak' as TOUType },
        { time: '2025-01-01T18:00:00', loadKw: 5, type: 'peak' as TOUType },
        { time: '2025-01-01T22:00:00', loadKw: 2, type: 'valley' as TOUType },
      ];
      const pvCurve = [
        createHourlyPV('2025-01-01T06:00:00', 0),
        createHourlyPV('2025-01-01T10:00:00', 5),
        createHourlyPV('2025-01-01T12:00:00', 8),
        createHourlyPV('2025-01-01T18:00:00', 1),
        createHourlyPV('2025-01-01T22:00:00', 0),
      ];

      const result = calculateBalance(loadCurve, pvCurve);

      // Hour 06: load=2, pv=0 -> self=0, draw=2
      // Hour 10: load=3, pv=5 -> self=3, feedIn=2
      // Hour 12: load=4, pv=8 -> self=4, feedIn=4
      // Hour 18: load=5, pv=1 -> self=1, draw=4
      // Hour 22: load=2, pv=0 -> self=0, draw=2
      expect(result.selfConsumptionKwh).toBe(8); // 0+3+4+1+0
      expect(result.gridFeedInKwh).toBe(6); // 0+2+4+0+0
      expect(result.gridDrawKwh).toBe(8); // 2+0+0+4+2
      expect(result.totalLoadKwh).toBe(16);
      expect(result.totalPvKwh).toBe(14);
      expect(result.selfConsumptionRate).toBeCloseTo(8 / 14, 5);
      expect(result.selfSufficiencyRate).toBeCloseTo(8 / 16, 5);
    });
  });
});
