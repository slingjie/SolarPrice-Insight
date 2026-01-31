import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllHolidays,
  saveHoliday,
  deleteHoliday,
  initDefaultHolidays,
  expandHolidayDates
} from './holidayService';
import type { HolidayDefinition } from '../types';

let mockHolidays: HolidayDefinition[] = [];

vi.mock('./db', () => ({
  getDatabase: vi.fn().mockResolvedValue({
    holidays: {
      find: () => ({
        exec: () => Promise.resolve(mockHolidays.map(h => ({
          toJSON: () => h
        })))
      }),
      upsert: vi.fn((holiday: HolidayDefinition) => {
        const index = mockHolidays.findIndex(h => h.id === holiday.id);
        if (index >= 0) {
          mockHolidays[index] = holiday;
        } else {
          mockHolidays.push(holiday);
        }
        return Promise.resolve();
      }),
      findOne: (id: string) => ({
        exec: () => {
          const holiday = mockHolidays.find(h => h.id === id);
          if (!holiday) return Promise.resolve(null);
          return Promise.resolve({
            remove: () => {
              mockHolidays = mockHolidays.filter(h => h.id !== id);
              return Promise.resolve();
            }
          });
        }
      })
    }
  })
}));

describe('holidayService', () => {
  beforeEach(() => {
    mockHolidays = [];
  });

  describe('getAllHolidays', () => {
    it('should return empty array when no holidays exist', async () => {
      const holidays = await getAllHolidays();
      expect(holidays).toEqual([]);
    });

    it('should return all holidays', async () => {
      const holiday1: HolidayDefinition = {
        id: 'test-1',
        name: '春节',
        startDate: '01-31',
        endDate: '02-06',
        isDefault: true,
        updated_at: new Date().toISOString()
      };
      const holiday2: HolidayDefinition = {
        id: 'test-2',
        name: '国庆节',
        startDate: '10-01',
        endDate: '10-07',
        isDefault: true,
        updated_at: new Date().toISOString()
      };

      await saveHoliday(holiday1);
      await saveHoliday(holiday2);

      const holidays = await getAllHolidays();
      expect(holidays).toHaveLength(2);
      expect(holidays.map(h => h.name)).toContain('春节');
      expect(holidays.map(h => h.name)).toContain('国庆节');
    });
  });

  describe('saveHoliday', () => {
    it('should insert a new holiday', async () => {
      const holiday: HolidayDefinition = {
        id: 'new-holiday',
        name: '元旦',
        startDate: '01-01',
        endDate: '01-03',
        isDefault: false,
        updated_at: new Date().toISOString()
      };

      await saveHoliday(holiday);

      const holidays = await getAllHolidays();
      expect(holidays).toHaveLength(1);
      expect(holidays[0].name).toBe('元旦');
      expect(holidays[0].startDate).toBe('01-01');
      expect(holidays[0].endDate).toBe('01-03');
    });

    it('should update an existing holiday', async () => {
      const holiday: HolidayDefinition = {
        id: 'update-test',
        name: '清明节',
        startDate: '04-04',
        endDate: '04-06',
        isDefault: true,
        updated_at: new Date().toISOString()
      };

      await saveHoliday(holiday);

      const updatedHoliday: HolidayDefinition = {
        ...holiday,
        startDate: '04-03',
        endDate: '04-05',
        updated_at: new Date().toISOString()
      };

      await saveHoliday(updatedHoliday);

      const holidays = await getAllHolidays();
      expect(holidays).toHaveLength(1);
      expect(holidays[0].startDate).toBe('04-03');
      expect(holidays[0].endDate).toBe('04-05');
    });
  });

  describe('deleteHoliday', () => {
    it('should delete a holiday by id', async () => {
      const holiday: HolidayDefinition = {
        id: 'to-delete',
        name: '端午节',
        startDate: '05-01',
        endDate: '05-03',
        isDefault: true,
        updated_at: new Date().toISOString()
      };

      await saveHoliday(holiday);
      expect(await getAllHolidays()).toHaveLength(1);

      await deleteHoliday('to-delete');

      const holidays = await getAllHolidays();
      expect(holidays).toHaveLength(0);
    });

    it('should not throw error when deleting non-existent holiday', async () => {
      await expect(deleteHoliday('non-existent')).resolves.not.toThrow();
    });
  });

  describe('initDefaultHolidays', () => {
    it('should populate default holidays', async () => {
      await initDefaultHolidays();

      const holidays = await getAllHolidays();
      expect(holidays.length).toBeGreaterThan(0);
      
      const defaultHolidays = holidays.filter(h => h.isDefault);
      expect(defaultHolidays.length).toBeGreaterThan(0);

      // Check for common Chinese holidays
      const names = holidays.map(h => h.name);
      expect(names).toContain('春节');
      expect(names).toContain('国庆节');
    });

    it('should not duplicate holidays if called multiple times', async () => {
      await initDefaultHolidays();
      const firstCount = (await getAllHolidays()).length;

      await initDefaultHolidays();
      const secondCount = (await getAllHolidays()).length;

      expect(secondCount).toBe(firstCount);
    });
  });

  describe('expandHolidayDates', () => {
    it('should expand single day holiday', () => {
      const holiday: HolidayDefinition = {
        id: 'single-day',
        name: '元旦',
        startDate: '01-01',
        endDate: '01-01',
        isDefault: true,
        updated_at: new Date().toISOString()
      };

      const dates = expandHolidayDates(holiday);
      expect(dates).toEqual(['01-01']);
    });

    it('should expand same-month date range', () => {
      const holiday: HolidayDefinition = {
        id: 'same-month',
        name: '国庆节',
        startDate: '10-01',
        endDate: '10-07',
        isDefault: true,
        updated_at: new Date().toISOString()
      };

      const dates = expandHolidayDates(holiday);
      expect(dates).toEqual([
        '10-01',
        '10-02',
        '10-03',
        '10-04',
        '10-05',
        '10-06',
        '10-07'
      ]);
    });

    it('should expand cross-month date range (春节)', () => {
      const holiday: HolidayDefinition = {
        id: 'cross-month',
        name: '春节',
        startDate: '01-29',
        endDate: '02-04',
        isDefault: true,
        updated_at: new Date().toISOString()
      };

      const dates = expandHolidayDates(holiday);
      expect(dates).toEqual([
        '01-29',
        '01-30',
        '01-31',
        '02-01',
        '02-02',
        '02-03',
        '02-04'
      ]);
    });

    it('should expand cross-month date range (元旦)', () => {
      const holiday: HolidayDefinition = {
        id: 'new-year',
        name: '元旦跨年',
        startDate: '12-30',
        endDate: '01-02',
        isDefault: false,
        updated_at: new Date().toISOString()
      };

      const dates = expandHolidayDates(holiday);
      expect(dates).toEqual([
        '12-30',
        '12-31',
        '01-01',
        '01-02'
      ]);
    });

    it('should warn when holiday contains 02-29 (leap day)', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const holiday: HolidayDefinition = {
        id: 'leap-day',
        name: '闰日节',
        startDate: '02-28',
        endDate: '03-01',
        isDefault: false,
        updated_at: new Date().toISOString()
      };

      const dates = expandHolidayDates(holiday);
      
      expect(dates).toContain('02-29');
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnCall = consoleWarnSpy.mock.calls[0][0];
      expect(warnCall).toContain('02-29');
      expect(warnCall).toContain('闰日节');

      consoleWarnSpy.mockRestore();
    });

    it('should expand 02-29 as single day holiday with warning', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const holiday: HolidayDefinition = {
        id: 'leap-single',
        name: '闰日',
        startDate: '02-29',
        endDate: '02-29',
        isDefault: false,
        updated_at: new Date().toISOString()
      };

      const dates = expandHolidayDates(holiday);
      
      expect(dates).toEqual(['02-29']);
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnCall = consoleWarnSpy.mock.calls[0][0];
      expect(warnCall).toContain('02-29');
      expect(warnCall).toContain('闰日');

      consoleWarnSpy.mockRestore();
    });

    it('should handle multi-month ranges correctly', () => {
      const holiday: HolidayDefinition = {
        id: 'long-holiday',
        name: '长假期',
        startDate: '01-15',
        endDate: '01-20',
        isDefault: false,
        updated_at: new Date().toISOString()
      };

      const dates = expandHolidayDates(holiday);
      expect(dates).toHaveLength(6);
      expect(dates[0]).toBe('01-15');
      expect(dates[dates.length - 1]).toBe('01-20');
    });
  });
});
