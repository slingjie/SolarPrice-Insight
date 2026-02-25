import { describe, expect, it } from 'vitest';
import { TariffData } from '../types';
import { buildCombinationHistory, resolvePwaFilters } from './pwaViewModel';

const createTariff = (params: Partial<TariffData> & { id: string; month: string }): TariffData => ({
  id: params.id,
  created_at: '2026-01-01T00:00:00.000Z',
  province: params.province || '江苏省',
  city: null,
  month: params.month,
  category: params.category || '大工业',
  voltage_level: params.voltage_level || '10kV',
  prices: {
    tip: 1,
    peak: 0.8,
    flat: 0.6,
    valley: 0.4,
    ...(params.prices || {}),
  },
  time_rules: params.time_rules || [],
  currency_unit: 'CNY/kWh',
  last_modified: params.last_modified || '2026-01-01T00:00:00.000Z',
});

const tariffs: TariffData[] = [
  createTariff({ id: 'js-2026-02-old', month: '2026-02', last_modified: '2026-02-01T00:00:00.000Z' }),
  createTariff({ id: 'js-2026-02-new', month: '2026-02', last_modified: '2026-02-05T00:00:00.000Z' }),
  createTariff({ id: 'js-2026-01', month: '2026-01', last_modified: '2026-01-05T00:00:00.000Z' }),
  createTariff({
    id: 'gd-2026-02',
    month: '2026-02',
    province: '广东省',
    category: '一般工商业',
    voltage_level: '35kV',
  }),
];

describe('pwaViewModel', () => {
  it('deduplicates same month records by latest last_modified', () => {
    const history = buildCombinationHistory(tariffs, '江苏省', '大工业', '10kV');
    expect(history).toHaveLength(2);
    expect(history[0].id).toBe('js-2026-02-new');
    expect(history[1].id).toBe('js-2026-01');
  });

  it('defaults month to current system month when available', () => {
    const resolved = resolvePwaFilters({
      tariffs,
      draft: { province: '', category: '', voltage: '', month: '' },
      currentSystemMonth: '2026-02',
      monthTouched: false,
    });

    expect(resolved.selection.month).toBe('2026-02');
    expect(resolved.monthFallbackReason).toBe('none');
  });

  it('falls back to latest month and reports warning reason when current month missing', () => {
    const resolved = resolvePwaFilters({
      tariffs,
      draft: { province: '江苏省', category: '大工业', voltage: '10kV', month: '' },
      currentSystemMonth: '2026-04',
      monthTouched: false,
    });

    expect(resolved.selection.month).toBe('2026-02');
    expect(resolved.monthFallbackReason).toBe('missing_current_month');
  });

  it('falls back to current month when manual month is invalid', () => {
    const resolved = resolvePwaFilters({
      tariffs,
      draft: { province: '江苏省', category: '大工业', voltage: '10kV', month: '2024-01' },
      currentSystemMonth: '2026-02',
      monthTouched: true,
    });

    expect(resolved.selection.month).toBe('2026-02');
    expect(resolved.monthFallbackReason).toBe('invalid_selected_month');
  });
});
