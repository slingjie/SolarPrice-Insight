import { describe, it, expect } from 'vitest';
import {
  toChinaHourKeyFromIsoUtc,
  toIsoLocalFromMonthDayHour,
  toHourKeyFromMonthDayHour,
  hourKeyToMonthDayHour,
} from './timeKey';

describe('timeKey utilities', () => {
  describe('toChinaHourKeyFromIsoUtc', () => {
    it('should convert UTC time to China hour key (MM-DD HH:00)', () => {
      // 2005-01-01T00:10:00Z (UTC) → +8 hours → 01-01 08:00
      expect(toChinaHourKeyFromIsoUtc('2005-01-01T00:10:00Z')).toBe('01-01 08:00');
    });

    it('should floor minutes to hour boundary', () => {
      // 2005-01-01T00:45:00Z → 01-01 08:00 (minute floored)
      expect(toChinaHourKeyFromIsoUtc('2005-01-01T00:45:00Z')).toBe('01-01 08:00');
    });

    it('should handle minute 0', () => {
      expect(toChinaHourKeyFromIsoUtc('2005-01-01T00:00:00Z')).toBe('01-01 08:00');
    });

    it('should handle cross-day UTC+8 shift', () => {
      // 2005-01-01T23:00:00Z (UTC) → +8 → 2005-01-02T07:00 (China)
      expect(toChinaHourKeyFromIsoUtc('2005-01-01T23:00:00Z')).toBe('01-02 07:00');
    });

    it('should handle cross-month UTC+8 shift', () => {
      // 2005-01-31T20:00:00Z (UTC) → +8 → 2005-02-01T04:00 (China)
      expect(toChinaHourKeyFromIsoUtc('2005-01-31T20:00:00Z')).toBe('02-01 04:00');
    });

    it('should handle cross-year UTC+8 shift', () => {
      // 2005-12-31T22:00:00Z (UTC) → +8 → 2006-01-01T06:00 (China)
      // But plan says baseYear=2021, so we preserve month wrapping within 12 months
      expect(toChinaHourKeyFromIsoUtc('2005-12-31T22:00:00Z')).toBe('01-01 06:00');
    });

    it('should pad month and day with zero', () => {
      // 2005-03-05T00:00:00Z → 03-05 08:00 (padded)
      expect(toChinaHourKeyFromIsoUtc('2005-03-05T00:00:00Z')).toBe('03-05 08:00');
    });

    it('should handle hour 23 UTC + 8 → hour 07 next day', () => {
      // 2005-06-15T23:30:00Z → 06-16 07:00
      expect(toChinaHourKeyFromIsoUtc('2005-06-15T23:30:00Z')).toBe('06-16 07:00');
    });

    it('should handle hour 0 UTC + 8 → hour 08 same day', () => {
      // 2005-06-15T00:00:00Z → 06-15 08:00
      expect(toChinaHourKeyFromIsoUtc('2005-06-15T00:00:00Z')).toBe('06-15 08:00');
    });

    it('should handle Feb 28/29 boundary (non-leap year 2021)', () => {
      // 2005-02-28T20:00:00Z (UTC) → +8 → 03-01
      expect(toChinaHourKeyFromIsoUtc('2005-02-28T20:00:00Z')).toBe('03-01 04:00');
    });

    it('should ignore year in PVGIS input (only extract month-day-hour)', () => {
      // Two PVGIS dates with different years should produce same key (month-day-hour only)
      expect(toChinaHourKeyFromIsoUtc('2005-01-15T12:00:00Z')).toBe(
        toChinaHourKeyFromIsoUtc('2021-01-15T12:00:00Z')
      );
    });
  });

  describe('toHourKeyFromMonthDayHour', () => {
    it('should create hour key from month/day/hour', () => {
      expect(toHourKeyFromMonthDayHour(1, 1, 8)).toBe('01-01 08:00');
    });

    it('should pad all components with zero', () => {
      expect(toHourKeyFromMonthDayHour(3, 5, 9)).toBe('03-05 09:00');
    });

    it('should handle hour 0', () => {
      expect(toHourKeyFromMonthDayHour(1, 1, 0)).toBe('01-01 00:00');
    });

    it('should handle hour 23', () => {
      expect(toHourKeyFromMonthDayHour(12, 31, 23)).toBe('12-31 23:00');
    });

    it('should handle day 1', () => {
      expect(toHourKeyFromMonthDayHour(6, 1, 12)).toBe('06-01 12:00');
    });

    it('should handle day 31', () => {
      expect(toHourKeyFromMonthDayHour(7, 31, 15)).toBe('07-31 15:00');
    });
  });

  describe('toIsoLocalFromMonthDayHour', () => {
    it('should create ISO local string with +08:00 timezone', () => {
      // baseYear=2021, month=1, day=1, hour=8
      const result = toIsoLocalFromMonthDayHour(2021, 1, 1, 8);
      expect(result).toBe('2021-01-01T08:00:00+08:00');
    });

    it('should pad month/day/hour with zero', () => {
      const result = toIsoLocalFromMonthDayHour(2021, 3, 5, 9);
      expect(result).toBe('2021-03-05T09:00:00+08:00');
    });

    it('should handle hour 0', () => {
      const result = toIsoLocalFromMonthDayHour(2021, 1, 1, 0);
      expect(result).toBe('2021-01-01T00:00:00+08:00');
    });

    it('should handle hour 23', () => {
      const result = toIsoLocalFromMonthDayHour(2021, 12, 31, 23);
      expect(result).toBe('2021-12-31T23:00:00+08:00');
    });

    it('should use provided baseYear', () => {
      const result = toIsoLocalFromMonthDayHour(2020, 2, 29, 12);
      expect(result).toBe('2020-02-29T12:00:00+08:00');
    });

    it('should respect non-leap year 2021 (no Feb 29)', () => {
      // This function should work for valid dates only
      const result = toIsoLocalFromMonthDayHour(2021, 2, 28, 12);
      expect(result).toBe('2021-02-28T12:00:00+08:00');
    });

    it('should produce valid ISO 8601 string', () => {
      const result = toIsoLocalFromMonthDayHour(2021, 6, 15, 14);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+08:00$/);
    });
  });

  describe('hourKeyToMonthDayHour', () => {
    it('should parse hour key to month/day/hour object', () => {
      const result = hourKeyToMonthDayHour('01-15 08:00');
      expect(result).toEqual({ month: 1, day: 15, hour: 8 });
    });

    it('should handle zero-padded values', () => {
      const result = hourKeyToMonthDayHour('03-05 09:00');
      expect(result).toEqual({ month: 3, day: 5, hour: 9 });
    });

    it('should handle month 12', () => {
      const result = hourKeyToMonthDayHour('12-31 23:00');
      expect(result).toEqual({ month: 12, day: 31, hour: 23 });
    });

    it('should handle hour 0', () => {
      const result = hourKeyToMonthDayHour('01-01 00:00');
      expect(result).toEqual({ month: 1, day: 1, hour: 0 });
    });

    it('should handle day 1', () => {
      const result = hourKeyToMonthDayHour('06-01 12:00');
      expect(result).toEqual({ month: 6, day: 1, hour: 12 });
    });

    it('should throw error on invalid format', () => {
      expect(() => hourKeyToMonthDayHour('invalid')).toThrow();
    });

    it('should throw error on invalid month', () => {
      expect(() => hourKeyToMonthDayHour('13-01 12:00')).toThrow();
    });

    it('should throw error on invalid day', () => {
      expect(() => hourKeyToMonthDayHour('01-32 12:00')).toThrow();
    });

    it('should throw error on invalid hour', () => {
      expect(() => hourKeyToMonthDayHour('01-01 24:00')).toThrow();
    });

    it('should round-trip with toHourKeyFromMonthDayHour', () => {
      const original = { month: 7, day: 15, hour: 14 };
      const key = toHourKeyFromMonthDayHour(original.month, original.day, original.hour);
      const parsed = hourKeyToMonthDayHour(key);
      expect(parsed).toEqual(original);
    });
  });

  describe('integration: PVGIS → TimeKey alignment', () => {
    it('should handle PVGIS entry with UTC time and minute=10', () => {
      // PVGIS: 2005-01-01T00:10:00Z
      // Expected China time: 01-01 08:00 (minute floored)
      const key = toChinaHourKeyFromIsoUtc('2005-01-01T00:10:00Z');
      expect(key).toBe('01-01 08:00');

      // Parse back
      const parsed = hourKeyToMonthDayHour(key);
      expect(parsed).toEqual({ month: 1, day: 1, hour: 8 });
    });

    it('should handle PVGIS cross-day shift and create IsoLocal', () => {
      // PVGIS: 2005-12-31T22:00:00Z → China: 2021-01-01 06:00 (wrapped year, same baseYear)
      const key = toChinaHourKeyFromIsoUtc('2005-12-31T22:00:00Z');
      expect(key).toBe('01-01 06:00');

      // Convert to IsoLocal for display
      const parsed = hourKeyToMonthDayHour(key);
      const isoLocal = toIsoLocalFromMonthDayHour(2021, parsed.month, parsed.day, parsed.hour);
      expect(isoLocal).toBe('2021-01-01T06:00:00+08:00');
    });

    it('should accumulate multiple PVGIS hours into same key', () => {
      // Two PVGIS entries with minutes 10 and 45 → same hour key (both floor to 08:00)
      const key1 = toChinaHourKeyFromIsoUtc('2005-01-01T00:10:00Z');
      const key2 = toChinaHourKeyFromIsoUtc('2005-01-01T00:45:00Z');
      expect(key1).toBe(key2);
      expect(key1).toBe('01-01 08:00');
    });
  });

  describe('deterministic weekday calculation (future use)', () => {
    it('should allow parsing for weekday calculation', () => {
      // 2021-01-02 is Saturday (weekday 6)
      const parsed = hourKeyToMonthDayHour('01-02 00:00');
      const date = new Date(Date.UTC(2021, parsed.month - 1, parsed.day));
      expect(date.getUTCDay()).toBe(6); // Saturday
    });

    it('should allow parsing for 2021-01-03 (Sunday)', () => {
      // 2021-01-03 is Sunday (weekday 0)
      const parsed = hourKeyToMonthDayHour('01-03 00:00');
      const date = new Date(Date.UTC(2021, parsed.month - 1, parsed.day));
      expect(date.getUTCDay()).toBe(0); // Sunday
    });
  });
});
