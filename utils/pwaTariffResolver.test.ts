import { describe, expect, it } from 'vitest';
import { ComprehensiveResult, TariffData, TimeConfig, TimeType } from '../types';
import {
  buildComprehensivePriceMap,
  isMonthIncludedInSavedResult,
  parseYearMonth,
  resolveEffectiveTimeRules,
} from './pwaTariffResolver';

const createTariff = (params: Partial<TariffData> & { id: string; month: string; province?: string }): TariffData => ({
  id: params.id,
  created_at: '2026-01-01T00:00:00.000Z',
  province: params.province || '江苏省',
  city: null,
  month: params.month,
  category: '大工业',
  voltage_level: '10kV',
  prices: {
    tip: 1,
    peak: 1,
    flat: 1,
    valley: 1,
    deep: 1,
    ...(params.prices || {}),
  },
  time_rules: params.time_rules ?? [],
  currency_unit: 'CNY/kWh',
  last_modified: '2026-01-01T00:00:00.000Z',
});

const createMonthlyConfig = (type: TimeType): TimeConfig => ({
  id: `cfg-${type}`,
  province: '江苏省',
  year: 2026,
  config_type: 'monthly',
  month_pattern: 'All',
  time_rules: [{ start: '00:00', end: '24:00', type }],
  updated_at: '2026-01-01T00:00:00.000Z',
  last_modified: '2026-01-01T00:00:00.000Z',
});

describe('pwaTariffResolver', () => {
  it('parses YYYY-MM month values', () => {
    expect(parseYearMonth('2026-03')).toEqual({
      year: 2026,
      month: 3,
      normalized: '2026-03',
    });
    expect(parseYearMonth('2026-13')).toBeNull();
  });

  it('matches saved month by exact and month token', () => {
    expect(isMonthIncludedInSavedResult('2026-03', ['2026-03'])).toBe(true);
    expect(isMonthIncludedInSavedResult('2026-03', ['03'])).toBe(true);
    expect(isMonthIncludedInSavedResult('2026-03', ['3'])).toBe(true);
    expect(isMonthIncludedInSavedResult('2026-03', ['2026-02'])).toBe(false);
  });

  it('prefers tariff rules and falls back to time_configs rules', () => {
    const tariffWithRules = createTariff({
      id: 't-1',
      month: '2026-03',
      time_rules: [{ start: '00:00', end: '24:00', type: 'flat' }],
    });

    const fromTariff = resolveEffectiveTimeRules(tariffWithRules, [createMonthlyConfig('valley')]);
    expect(fromTariff.source).toBe('tariff');
    expect(fromTariff.rules[0].type).toBe('flat');

    const tariffWithoutRules = createTariff({
      id: 't-2',
      month: '2026-03',
      time_rules: [],
    });

    const fromConfig = resolveEffectiveTimeRules(tariffWithoutRules, [createMonthlyConfig('valley')]);
    expect(fromConfig.source).toBe('time_configs');
    expect(fromConfig.rules[0].type).toBe('valley');
  });

  it('builds comprehensive map only for included months', () => {
    const tariffs = [
      createTariff({ id: 't-mar', month: '2026-03', prices: { valley: 0.2 } }),
      createTariff({ id: 't-feb', month: '2026-02', prices: { valley: 0.4 } }),
    ];

    const saved: ComprehensiveResult = {
      id: 'comp-js',
      province: '江苏省',
      category: '大工业',
      voltage_level: '10kV',
      avg_price: 0,
      months: ['2026-03'],
      start_time: '00:00',
      end_time: '24:00',
      last_modified: '2026-03-01T00:00:00.000Z',
    };

    const map = buildComprehensivePriceMap({
      tariffs,
      timeConfigs: [createMonthlyConfig('valley')],
      resultsByProvince: { 江苏省: saved },
    });

    expect(map['t-mar']).toBeCloseTo(0.2, 6);
    expect(map['t-feb']).toBeNull();
  });
});
