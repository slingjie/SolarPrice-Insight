import { describe, expect, it } from 'vitest';
import { TariffData } from '../types';
import {
  buildPwaAnnualConfigComboKey,
  buildRolling12Months,
  calculatePwaAnnualMetrics,
  getStoredPwaAnnualConfig,
  setStoredPwaAnnualConfig,
  sanitizePwaAnnualConfig,
} from './pwaAnnualPrice';

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

const createMemoryStorage = (): Storage => {
  const bucket = new Map<string, string>();
  return {
    get length() {
      return bucket.size;
    },
    clear() {
      bucket.clear();
    },
    getItem(key: string) {
      return bucket.has(key) ? bucket.get(key) || null : null;
    },
    key(index: number) {
      return Array.from(bucket.keys())[index] || null;
    },
    removeItem(key: string) {
      bucket.delete(key);
    },
    setItem(key: string, value: string) {
      bucket.set(key, value);
    },
  };
};

describe('pwaAnnualPrice', () => {
  it('builds rolling 12 months across year boundary', () => {
    const months = buildRolling12Months('2026-02');
    expect(months).toHaveLength(12);
    expect(months[0]).toBe('2025-03');
    expect(months[11]).toBe('2026-02');
  });

  it('calculates average from valid months only and keeps missing month list', () => {
    const history = [
      createTariff({ id: 'm1', month: '2026-02' }),
      createTariff({ id: 'm2', month: '2026-01' }),
    ];

    const metrics = calculatePwaAnnualMetrics({
      history,
      comprehensivePriceMap: {
        m1: 0.6,
        m2: null,
      },
      config: {
        mode: 'custom',
        anchorMonth: '2026-02',
        customMonths: ['2026-02', '2026-01', '2025-12'],
      },
    });

    expect(metrics.configuredMonths).toEqual(['2026-02', '2026-01', '2025-12']);
    expect(metrics.validMonths).toEqual(['2026-02']);
    expect(metrics.missingMonths).toEqual(['2026-01', '2025-12']);
    expect(metrics.effectiveCount).toBe(1);
    expect(metrics.average).toBeCloseTo(0.6, 6);
  });

  it('filters custom months by available months when sanitizing config', () => {
    const config = sanitizePwaAnnualConfig({
      config: {
        mode: 'custom',
        anchorMonth: '2026-2',
        customMonths: ['2026-01', '2026-03', 'bad', '2026-03'],
      },
      currentSystemMonth: '2026-02',
      availableMonths: ['2026-03', '2026-02'],
    });

    expect(config.anchorMonth).toBe('2026-02');
    expect(config.customMonths).toEqual(['2026-03']);
  });

  it('persists annual config by combo key', () => {
    const storage = createMemoryStorage();

    const comboKey = buildPwaAnnualConfigComboKey({
      province: '江苏省',
      category: '大工业',
      voltage: '10kV',
    });

    setStoredPwaAnnualConfig({
      comboKey,
      config: {
        mode: 'custom',
        anchorMonth: '2026-02',
        customMonths: ['2026-02'],
      },
      currentSystemMonth: '2026-02',
      availableMonths: ['2026-02', '2026-01'],
      storage,
    });

    const loaded = getStoredPwaAnnualConfig({
      comboKey,
      currentSystemMonth: '2026-02',
      availableMonths: ['2026-02', '2026-01'],
      storage,
    });

    expect(loaded.mode).toBe('custom');
    expect(loaded.customMonths).toEqual(['2026-02']);
  });
});
