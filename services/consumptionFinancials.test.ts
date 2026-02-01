import { describe, expect, it } from 'vitest';

import type { TariffData } from '../types';

import type { HourlyAlignedRow } from './consumptionAlignedService';
import { calculateConsumptionFinancials } from './consumptionFinancials';

function row(partial: Partial<HourlyAlignedRow>): HourlyAlignedRow {
  return {
    timeKey: '01-01 00:00',
    timeIsoLocal: '2021-01-01T00:00:00+08:00',
    month: 1,
    day: 1,
    hour: 0,
    dayType: 'workday',
    level: 'A',
    touType: 'flat',
    loadKwh: 0,
    pvKwh: 0,
    selfKwh: 0,
    gridExportKwh: 0,
    gridImportKwh: 0,
    ...partial,
  };
}

describe('consumptionFinancials', () => {
  it('selects tariffs by month with year fallback and computes totals', () => {
    const tariffs: TariffData[] = [
      {
        id: 't-jan-2024',
        created_at: '2024-01-01',
        last_modified: '2024-01-01T00:00:00Z',
        province: 'Jiangsu',
        city: null,
        month: '2024-1',
        category: 'Large Industry',
        voltage_level: '1-10kV',
        prices: { tip: 1, peak: 0.9, flat: 0.8, valley: 0.5 },
        time_rules: [],
        currency_unit: 'CNY',
      },
      {
        id: 't-jan-2025',
        created_at: '2025-01-01',
        last_modified: '2025-01-01T00:00:00Z',
        province: 'Jiangsu',
        city: null,
        month: '2025-01',
        category: 'Large Industry',
        voltage_level: '1-10kV',
        prices: { tip: 2, peak: 1.5, flat: 1.2, valley: 1.0 },
        time_rules: [],
        currency_unit: 'CNY',
      },
      {
        id: 't-feb-2025',
        created_at: '2025-02-01',
        last_modified: '2025-02-01T00:00:00Z',
        province: 'Jiangsu',
        city: null,
        month: '2025-02',
        category: 'Large Industry',
        voltage_level: '1-10kV',
        prices: { tip: 9, peak: 8, flat: 7, valley: 6 },
        time_rules: [],
        currency_unit: 'CNY',
      },
    ];

    const hourly: HourlyAlignedRow[] = [
      // Jan: should use Jan-2025 tariff.
      row({
        timeKey: '01-01 10:00',
        timeIsoLocal: '2021-01-01T10:00:00+08:00',
        month: 1,
        day: 1,
        hour: 10,
        touType: 'tip',
        loadKwh: 10,
        selfKwh: 4,
        gridImportKwh: 6,
        gridExportKwh: 0,
      }),
      // Jan deep: missing deep price -> fall back to valley price.
      row({
        timeKey: '01-01 03:00',
        timeIsoLocal: '2021-01-01T03:00:00+08:00',
        month: 1,
        day: 1,
        hour: 3,
        touType: 'deep',
        loadKwh: 5,
        selfKwh: 0,
        gridImportKwh: 0,
        gridExportKwh: 2,
        pvKwh: 2,
      }),
      // Mar: no Mar entries -> fall back to latest tariff across any month (Feb-2025).
      row({
        timeKey: '03-01 10:00',
        timeIsoLocal: '2021-03-01T10:00:00+08:00',
        month: 3,
        day: 1,
        hour: 10,
        touType: 'peak',
        loadKwh: 1,
        selfKwh: 0,
        gridImportKwh: 1,
        gridExportKwh: 0,
      }),
    ];

    const result = calculateConsumptionFinancials({
      hourly,
      tariffs,
      feedInTariff: 0.35,
    });

    expect(result.currencyUnit).toBe('CNY');

    // Baseline cost:
    // - Jan tip: 10 * 2
    // - Jan deep -> valley: 5 * 1
    // - Mar peak -> Feb-2025 peak: 1 * 8
    expect(result.totals.baselineGridCost).toBeCloseTo(33, 10);

    // Import cost:
    // - Jan tip: 6 * 2
    // - Mar peak: 1 * 8
    expect(result.totals.importCost).toBeCloseTo(20, 10);

    // Export revenue:
    // - Jan deep: 2 * 0.35
    expect(result.totals.exportRevenue).toBeCloseTo(0.7, 10);
    expect(result.totals.withPvNetCost).toBeCloseTo(19.3, 10);
    expect(result.totals.savingsVsNoPv).toBeCloseTo(13.7, 10);

    expect(result.warnings.some((w) => w.includes('深谷'))).toBe(true);
  });
});
