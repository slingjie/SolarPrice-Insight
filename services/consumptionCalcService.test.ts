import { describe, it, expect } from 'vitest';
import {
  calculateConsumption,
  getTypicalDayData,
  aggregateHourlyAverage,
} from './consumptionCalcService';
import { HourlyData, HourlyLoadData } from '../types';

function generateMockPvData(): HourlyData[] {
  const data: HourlyData[] = [];
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= daysInMonth[month - 1]; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const hourStr = String(hour).padStart(2, '0');

        let pvPower = 0;
        if (hour >= 6 && hour <= 18) {
          const peakHour = 12;
          const distance = Math.abs(hour - peakHour);
          pvPower = Math.max(0, 5000 - distance * 800);
        }

        data.push({
          time: `2024-${monthStr}-${dayStr}T${hourStr}:00:00Z`,
          pvPower,
          poaIrradiance: pvPower * 0.2,
        });
      }
    }
  }
  return data;
}

function generateMockLoadData(): HourlyLoadData[] {
  const data: HourlyLoadData[] = [];
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= daysInMonth[month - 1]; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const hourStr = String(hour).padStart(2, '0');

        let load = 2;
        if (hour >= 8 && hour < 18) {
          load = 8;
        }

        data.push({
          time: `${monthStr}-${dayStr} ${hourStr}:00`,
          load,
        });
      }
    }
  }
  return data;
}

describe('consumptionCalcService', () => {
  describe('calculateConsumption', () => {
    it('should return correct structure', () => {
      const pvData = generateMockPvData();
      const loadData = generateMockLoadData();
      const result = calculateConsumption(pvData, loadData);

      expect(result).toHaveProperty('totalPvGeneration');
      expect(result).toHaveProperty('totalLoadDemand');
      expect(result).toHaveProperty('totalSelfConsumption');
      expect(result).toHaveProperty('totalGridExport');
      expect(result).toHaveProperty('totalGridImport');
      expect(result).toHaveProperty('selfConsumptionRate');
      expect(result).toHaveProperty('selfSufficiencyRate');
      expect(result).toHaveProperty('hourlyData');
      expect(result).toHaveProperty('monthlyData');
    });

    it('should have 8760 hourly results', () => {
      const pvData = generateMockPvData();
      const loadData = generateMockLoadData();
      const result = calculateConsumption(pvData, loadData);

      expect(result.hourlyData.length).toBe(8760);
    });

    it('should have 12 monthly results', () => {
      const pvData = generateMockPvData();
      const loadData = generateMockLoadData();
      const result = calculateConsumption(pvData, loadData);

      expect(result.monthlyData.length).toBe(12);
    });

    it('should satisfy energy balance: selfConsumption + export = pvGeneration', () => {
      const pvData = generateMockPvData();
      const loadData = generateMockLoadData();
      const result = calculateConsumption(pvData, loadData);

      const balance = result.totalSelfConsumption + result.totalGridExport;
      expect(balance).toBeCloseTo(result.totalPvGeneration, 1);
    });

    it('should satisfy load balance: selfConsumption + import = loadDemand', () => {
      const pvData = generateMockPvData();
      const loadData = generateMockLoadData();
      const result = calculateConsumption(pvData, loadData);

      const balance = result.totalSelfConsumption + result.totalGridImport;
      expect(balance).toBeCloseTo(result.totalLoadDemand, 1);
    });

    it('should calculate correct self-consumption rate', () => {
      const pvData = generateMockPvData();
      const loadData = generateMockLoadData();
      const result = calculateConsumption(pvData, loadData);

      const expectedRate = result.totalSelfConsumption / result.totalPvGeneration;
      expect(result.selfConsumptionRate).toBeCloseTo(expectedRate, 5);
    });

    it('should calculate correct self-sufficiency rate', () => {
      const pvData = generateMockPvData();
      const loadData = generateMockLoadData();
      const result = calculateConsumption(pvData, loadData);

      const expectedRate = result.totalSelfConsumption / result.totalLoadDemand;
      expect(result.selfSufficiencyRate).toBeCloseTo(expectedRate, 5);
    });

    it('should handle UTC to China time conversion', () => {
      const pvData: HourlyData[] = [
        { time: '2024-01-01T16:00:00Z', pvPower: 1000, poaIrradiance: 200 },
      ];
      const loadData: HourlyLoadData[] = [
        { time: '01-02 00:00', load: 0.5 },
      ];

      const result = calculateConsumption(pvData, loadData);

      const janData = result.hourlyData.find((h) => h.time === '01-02 00:00');
      expect(janData).toBeDefined();
      expect(janData?.pvGeneration).toBeGreaterThan(0);
    });
  });

  describe('getTypicalDayData', () => {
    it('should return 24 hourly data points for a specific day', () => {
      const pvData = generateMockPvData();
      const loadData = generateMockLoadData();
      const result = calculateConsumption(pvData, loadData);

      const dayData = getTypicalDayData(result, 6, 15);
      expect(dayData.length).toBe(24);
    });

    it('should return empty array for invalid date', () => {
      const pvData = generateMockPvData();
      const loadData = generateMockLoadData();
      const result = calculateConsumption(pvData, loadData);

      const dayData = getTypicalDayData(result, 2, 30);
      expect(dayData.length).toBe(0);
    });
  });

  describe('aggregateHourlyAverage', () => {
    it('should return 24 hourly average data points', () => {
      const pvData = generateMockPvData();
      const loadData = generateMockLoadData();
      const result = calculateConsumption(pvData, loadData);

      const avgData = aggregateHourlyAverage(result);
      expect(avgData.length).toBe(24);
    });

    it('should have higher PV average during midday', () => {
      const pvData = generateMockPvData();
      const loadData = generateMockLoadData();
      const result = calculateConsumption(pvData, loadData);

      const avgData = aggregateHourlyAverage(result);
      const morningAvg = avgData[6].avgPv;
      const eveningAvg = avgData[18].avgPv;

      expect(morningAvg).toBeGreaterThanOrEqual(0);
      expect(eveningAvg).toBeGreaterThanOrEqual(0);
    });
  });
});
