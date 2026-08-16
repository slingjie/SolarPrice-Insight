import { describe, it, expect } from 'vitest';
import {
  extractDateRanges,
  extractTimeRanges,
  parseSpecialPeriodsFromTariffs,
  applySpecialPeriodOverride,
} from './specialPeriodParser';
import { TariffData } from '../types';

describe('specialPeriodParser', () => {
  it('extracts date ranges formatted with slash syntax like 7/15-8/31 and 12/15-1/31', () => {
    const text = '尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行（7月上旬无尖峰）';
    const ranges = extractDateRanges(text, 2026);

    expect(ranges).toHaveLength(2);
    expect(ranges[0].start).toBe('2026-07-15');
    expect(ranges[0].end).toBe('2026-08-31');
    expect(ranges[0].isCrossYear).toBe(false);

    expect(ranges[1].start).toBe('2026-12-15');
    expect(ranges[1].end).toBe('2027-01-31');
    expect(ranges[1].isCrossYear).toBe(true);
  });

  it('extracts date ranges formatted with Chinese month day syntax', () => {
    const text = '重大节假日如 5月1-5日 及 10月1-7日 执行深谷';
    const ranges = extractDateRanges(text, 2026);

    expect(ranges).toHaveLength(2);
    expect(ranges[0].start).toBe('2026-05-01');
    expect(ranges[0].end).toBe('2026-05-05');
    expect(ranges[1].start).toBe('2026-10-01');
    expect(ranges[1].end).toBe('2026-10-07');
  });

  it('extracts hourly time ranges', () => {
    const text = '尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行';
    const timeRanges = extractTimeRanges(text);

    expect(timeRanges).toHaveLength(2);
    expect(timeRanges[0]).toEqual({ start: '20:00', end: '22:00' });
    expect(timeRanges[1]).toEqual({ start: '19:00', end: '21:00' });
  });

  it('parses special periods from tariffs with province matching', () => {
    const mockTariffs: Partial<TariffData>[] = [
      {
        id: 't-ah-1',
        province: '安徽省',
        month: '2026-08',
        policy_code: '皖发改价格〔2024〕112号',
        float_rules: {
          special_period_note: '尖峰时段仅在 7/15-8/31 20:00-22:00 及 12/15-1/31 19:00-21:00 执行（7月上旬无尖峰）',
        },
      },
    ];

    const results = parseSpecialPeriodsFromTariffs(mockTariffs as TariffData[], '安徽省', 2026);

    expect(results).toHaveLength(2);
    expect(results[0].startDate).toBe('2026-07-15');
    expect(results[0].endDate).toBe('2026-08-31');
    expect(results[0].overrideType).toBe('tip');
    expect(results[0].timeRangesDescription).toBe('20:00-22:00、19:00-21:00');
    expect(results[0].seasonTag).toBe('summer');
  });
});
