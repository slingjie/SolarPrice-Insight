import { describe, it, expect } from 'vitest';
import {
  generateHourlyLoadFromMonthly,
  previewDailyLoadCurve,
} from './loadDataService';
import { MonthlyLoadData, LoadProfileConfig, DEFAULT_LOAD_PROFILE_CONFIG } from '../types';

describe('loadDataService', () => {
  describe('generateHourlyLoadFromMonthly', () => {
    const mockMonthlyData: MonthlyLoadData[] = [
      { month: 1, consumption: 10000 },
      { month: 2, consumption: 9000 },
      { month: 3, consumption: 8000 },
      { month: 4, consumption: 7000 },
      { month: 5, consumption: 6000 },
      { month: 6, consumption: 12000 },
      { month: 7, consumption: 15000 },
      { month: 8, consumption: 14000 },
      { month: 9, consumption: 9000 },
      { month: 10, consumption: 8000 },
      { month: 11, consumption: 9000 },
      { month: 12, consumption: 11000 },
    ];

    it('should generate 8760 hourly data points for a full year', () => {
      const hourlyData = generateHourlyLoadFromMonthly(mockMonthlyData);
      expect(hourlyData.length).toBe(8760);
    });

    it('should have valid time format for all entries', () => {
      const hourlyData = generateHourlyLoadFromMonthly(mockMonthlyData);
      const timePattern = /^\d{2}-\d{2} \d{2}:00$/;
      hourlyData.forEach((entry) => {
        expect(entry.time).toMatch(timePattern);
      });
    });

    it('should have positive load values', () => {
      const hourlyData = generateHourlyLoadFromMonthly(mockMonthlyData);
      hourlyData.forEach((entry) => {
        expect(entry.load).toBeGreaterThanOrEqual(0);
      });
    });

    it('should apply seasonal multipliers correctly', () => {
      const config: LoadProfileConfig = {
        ...DEFAULT_LOAD_PROFILE_CONFIG,
        summerMonths: [6, 7, 8],
        summerMultiplier: 1.5,
        winterMonths: [12, 1, 2],
        winterMultiplier: 1.2,
      };

      const hourlyData = generateHourlyLoadFromMonthly(mockMonthlyData, config);

      const januaryData = hourlyData.filter((d) => d.time.startsWith('01-'));
      const juneData = hourlyData.filter((d) => d.time.startsWith('06-'));
      const aprilData = hourlyData.filter((d) => d.time.startsWith('04-'));

      const janTotal = januaryData.reduce((sum, d) => sum + d.load, 0);
      const juneTotal = juneData.reduce((sum, d) => sum + d.load, 0);
      const aprilTotal = aprilData.reduce((sum, d) => sum + d.load, 0);

      expect(janTotal).toBeGreaterThan(mockMonthlyData[0].consumption);
      expect(juneTotal).toBeGreaterThan(mockMonthlyData[5].consumption);
      expect(aprilTotal).toBeCloseTo(mockMonthlyData[3].consumption, -2);
    });

    it('should distribute load differently between workdays and holidays', () => {
      const config: LoadProfileConfig = {
        ...DEFAULT_LOAD_PROFILE_CONFIG,
        weekendAsHoliday: true,
        holidayRatio: 0.5,
      };

      const hourlyData = generateHourlyLoadFromMonthly(mockMonthlyData, config);

      const jan4Data = hourlyData.filter((d) => d.time.startsWith('01-04'));
      const jan6Data = hourlyData.filter((d) => d.time.startsWith('01-06'));

      const jan4Total = jan4Data.reduce((sum, d) => sum + d.load, 0);
      const jan6Total = jan6Data.reduce((sum, d) => sum + d.load, 0);

      expect(jan4Total).not.toEqual(jan6Total);
    });
  });

  describe('previewDailyLoadCurve', () => {
    it('should generate 24 hourly data points', () => {
      const curve = previewDailyLoadCurve(100, DEFAULT_LOAD_PROFILE_CONFIG, false);
      expect(curve.length).toBe(24);
    });

    it('should sum to approximately the daily consumption', () => {
      const dailyConsumption = 100;
      const curve = previewDailyLoadCurve(dailyConsumption, DEFAULT_LOAD_PROFILE_CONFIG, false);
      const total = curve.reduce((sum, point) => sum + point.load, 0);
      expect(total).toBeCloseTo(dailyConsumption, 0);
    });

    it('should have higher load during work hours for workday', () => {
      const config: LoadProfileConfig = {
        ...DEFAULT_LOAD_PROFILE_CONFIG,
        workdayStart: 9,
        workdayEnd: 17,
        workdayRatio: 0.8,
      };

      const curve = previewDailyLoadCurve(100, config, false);

      const workHourLoad = curve.filter((p) => p.hour >= 9 && p.hour < 17);
      const nonWorkHourLoad = curve.filter((p) => p.hour < 9 || p.hour >= 17);

      const avgWork = workHourLoad.reduce((s, p) => s + p.load, 0) / workHourLoad.length;
      const avgNonWork = nonWorkHourLoad.reduce((s, p) => s + p.load, 0) / nonWorkHourLoad.length;

      expect(avgWork).toBeGreaterThan(avgNonWork);
    });

    it('should have uniform distribution for holiday', () => {
      const curve = previewDailyLoadCurve(100, DEFAULT_LOAD_PROFILE_CONFIG, true);
      const first = curve[0].load;
      curve.forEach((point) => {
        expect(point.load).toBeCloseTo(first, 5);
      });
    });
  });
});
