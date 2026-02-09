import { describe, expect, it } from 'vitest';
import {
  resolveTimeConfigForDate,
  resolveTimeConfigForMonth,
  resolveTimeConfigForMonthAndDayKind,
} from './timeConfigResolver';
import { TimeConfig, TimeType } from '../types';

const createMonthlyConfig = (params: {
  id: string;
  province: string;
  year: number;
  monthPattern: string;
  type: TimeType;
  lastModified: string;
}): TimeConfig => ({
  id: params.id,
  province: params.province,
  year: params.year,
  config_type: 'monthly',
  month_pattern: params.monthPattern,
  time_rules: [{ start: '00:00', end: '24:00', type: params.type }],
  updated_at: params.lastModified,
  last_modified: params.lastModified,
});

const createSpecialDateConfig = (params: {
  id: string;
  province: string;
  date: string;
  endDate?: string;
  type: TimeType;
  lastModified: string;
}): TimeConfig => ({
  id: params.id,
  province: params.province,
  year: Number.parseInt(params.date.slice(0, 4), 10),
  config_type: 'special_date',
  month_pattern: 'Special',
  special_date: params.date,
  special_date_end: params.endDate,
  time_rules: [{ start: '00:00', end: '24:00', type: params.type }],
  updated_at: params.lastModified,
  last_modified: params.lastModified,
});

describe('timeConfigResolver', () => {
  it('resolves month config by exact year first', () => {
    const configs = [
      createMonthlyConfig({
        id: 'cfg-2025',
        province: '江苏省',
        year: 2025,
        monthPattern: 'All',
        type: 'flat',
        lastModified: '2025-01-01T00:00:00Z',
      }),
      createMonthlyConfig({
        id: 'cfg-2026',
        province: '江苏省',
        year: 2026,
        monthPattern: 'All',
        type: 'peak',
        lastModified: '2026-01-01T00:00:00Z',
      }),
    ];

    const y2025 = resolveTimeConfigForMonth(configs, '江苏', 1, 2025);
    const y2026 = resolveTimeConfigForMonth(configs, '江苏', 1, 2026);

    expect(y2025?.touGrid[0]).toBe('flat');
    expect(y2026?.touGrid[0]).toBe('peak');
  });

  it('falls back to wildcard province when exact province is missing', () => {
    const configs = [
      createMonthlyConfig({
        id: 'global-2026',
        province: '全部',
        year: 2026,
        monthPattern: 'All',
        type: 'valley',
        lastModified: '2026-01-01T00:00:00Z',
      }),
    ];

    const resolved = resolveTimeConfigForMonth(configs, '未知省份', 6, 2026);
    expect(resolved?.touGrid[3]).toBe('valley');
  });

  it('uses special-date rule before monthly rule on same day', () => {
    const configs = [
      createMonthlyConfig({
        id: 'month-2026-2',
        province: '江苏省',
        year: 2026,
        monthPattern: '2',
        type: 'flat',
        lastModified: '2026-01-01T00:00:00Z',
      }),
      createSpecialDateConfig({
        id: 'special-2026-02-10',
        province: '江苏省',
        date: '2026-02-10',
        type: 'tip',
        lastModified: '2026-02-01T00:00:00Z',
      }),
    ];

    const resolved = resolveTimeConfigForDate(configs, '江苏', '2026-02-10');
    expect(resolved?.touGrid[0]).toBe('tip');
  });

  it('falls back to monthly rule when special-date rule is absent', () => {
    const configs = [
      createMonthlyConfig({
        id: 'month-2026-2',
        province: '江苏省',
        year: 2026,
        monthPattern: '2',
        type: 'peak',
        lastModified: '2026-01-01T00:00:00Z',
      }),
    ];

    const resolved = resolveTimeConfigForDate(configs, '江苏', '2026-02-11');
    expect(resolved?.touGrid[0]).toBe('peak');
  });

  it('matches special-date range for any date within the interval', () => {
    const configs = [
      createMonthlyConfig({
        id: 'month-2026-2',
        province: '江苏省',
        year: 2026,
        monthPattern: '2',
        type: 'flat',
        lastModified: '2026-01-01T00:00:00Z',
      }),
      createSpecialDateConfig({
        id: 'special-range-1',
        province: '江苏省',
        date: '2026-02-10',
        endDate: '2026-02-15',
        type: 'deep',
        lastModified: '2026-02-01T00:00:00Z',
      }),
    ];

    const inRange = resolveTimeConfigForDate(configs, '江苏', '2026-02-12');
    const outRange = resolveTimeConfigForDate(configs, '江苏', '2026-02-16');

    expect(inRange?.touGrid[0]).toBe('deep');
    expect(outRange?.touGrid[0]).toBe('flat');
  });

  it('supports reversed special-date range ordering', () => {
    const configs = [
      createSpecialDateConfig({
        id: 'special-range-reversed',
        province: '江苏省',
        date: '2026-02-20',
        endDate: '2026-02-10',
        type: 'tip',
        lastModified: '2026-02-01T00:00:00Z',
      }),
    ];

    const resolved = resolveTimeConfigForDate(configs, '江苏', '2026-02-12');
    expect(resolved?.touGrid[0]).toBe('tip');
  });

  it('supports inline special_date range string without special_date_end', () => {
    const configs = [
      {
        id: 'special-inline',
        province: '江苏省',
        year: 2026,
        config_type: 'special_date' as const,
        month_pattern: 'Special',
        special_date: '2026-03-01~2026-03-03',
        time_rules: [{ start: '00:00', end: '24:00', type: 'valley' as TimeType }],
        updated_at: '2026-02-01T00:00:00Z',
        last_modified: '2026-02-01T00:00:00Z',
      },
    ];

    const resolved = resolveTimeConfigForDate(configs, '江苏', '2026-03-02');
    expect(resolved?.touGrid[0]).toBe('valley');
  });

  it('keeps compatibility for day-kind API and ignores weekday/weekend split', () => {
    const configs = [
      createMonthlyConfig({
        id: 'month-2026-1',
        province: '江苏省',
        year: 2026,
        monthPattern: '1',
        type: 'deep',
        lastModified: '2026-01-01T00:00:00Z',
      }),
    ];

    const weekday = resolveTimeConfigForMonthAndDayKind(configs, '江苏', 1, 'weekday', 2026);
    const weekend = resolveTimeConfigForMonthAndDayKind(configs, '江苏', 1, 'weekend', 2026);
    expect(weekday?.touGrid[0]).toBe('deep');
    expect(weekend?.touGrid[0]).toBe('deep');
  });
});
