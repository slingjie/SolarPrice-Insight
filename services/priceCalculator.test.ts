import { describe, it, expect } from 'vitest';
import {
    timeToMinutes,
    getOverlapMinutes,
    getTimeSegments,
    calculateAveragePrice,
    type CalculationResult,
} from './priceCalculator';
import { TariffData, TimeRule } from '../types';

describe('priceCalculator', () => {
    describe('timeToMinutes', () => {
        it('converts basic time to minutes', () => {
            expect(timeToMinutes('00:00')).toBe(0);
            expect(timeToMinutes('08:00')).toBe(480);
            expect(timeToMinutes('12:30')).toBe(750);
            expect(timeToMinutes('17:00')).toBe(1020);
            expect(timeToMinutes('23:59')).toBe(1439);
        });

        it('handles edge case of midnight', () => {
            expect(timeToMinutes('00:00')).toBe(0);
        });
    });

    describe('getOverlapMinutes', () => {
        it('calculates overlap for completely overlapping ranges', () => {
            expect(getOverlapMinutes(0, 480, 0, 480)).toBe(480);
        });

        it('calculates overlap for partial overlaps', () => {
            expect(getOverlapMinutes(400, 600, 500, 700)).toBe(100);
        });

        it('returns 0 for non-overlapping ranges', () => {
            expect(getOverlapMinutes(0, 100, 200, 300)).toBe(0);
        });

        it('handles adjacent ranges correctly', () => {
            expect(getOverlapMinutes(0, 100, 100, 200)).toBe(0);
        });

        it('handles one range inside another', () => {
            expect(getOverlapMinutes(100, 500, 200, 300)).toBe(100);
        });
    });

    describe('getTimeSegments', () => {
        it('handles simple same-day range', () => {
            const result = getTimeSegments('08:00', '17:00');
            expect(result).toEqual([[480, 1020]]);
        });

        it('handles full day range', () => {
            const result = getTimeSegments('00:00', '00:00');
            expect(result).toEqual([[0, 0]]);
        });

        it('handles cross-midnight range', () => {
            const result = getTimeSegments('22:00', '06:00');
            expect(result).toEqual([
                [1320, 1440],
                [0, 360],
            ]);
        });

        it('treats end time of 00:00 as 24:00 for non-midnight start', () => {
            const result = getTimeSegments('17:00', '00:00');
            expect(result).toEqual([[1020, 1440]]);
        });

        it('handles midnight start and end correctly', () => {
            const result = getTimeSegments('00:00', '06:00');
            expect(result).toEqual([[0, 360]]);
        });
    });

    describe('calculateAveragePrice', () => {
        const createMockTariff = (
            month: string,
            timeRules: TimeRule[],
            prices: Record<string, number>
        ): TariffData => ({
            id: `tariff-${month}`,
            created_at: new Date().toISOString(),
            province: 'TestProvince',
            city: null,
            month: month,
            category: 'TestCategory',
            voltage_level: '10kV',
            prices: {
                tip: prices.tip || 0,
                peak: prices.peak || 0,
                flat: prices.flat || 0,
                valley: prices.valley || 0,
                deep: prices.deep || 0,
            },
            time_rules: timeRules,
            currency_unit: 'CNY',
            last_modified: new Date().toISOString(),
        });

        it('calculates average price for standard 08:00-17:00 range', () => {
            const tariff = createMockTariff('2024-01', [
                {
                    start: '08:00',
                    end: '17:00',
                    type: 'flat',
                },
            ], {
                flat: 1.0,
            });

            const result = calculateAveragePrice(
                [tariff],
                ['2024-01'],
                '08:00',
                '17:00'
            );

            expect(result).toHaveLength(1);
            expect(result[0].month).toBe('2024-01');
            expect(result[0].avgPrice).toBeCloseTo(1.0, 4);
            expect(result[0].totalHours).toBe(9);
        });

        it('calculates correctly with multiple time periods in a day', () => {
            const tariff = createMockTariff('2024-01', [
                { start: '08:00', end: '12:00', type: 'peak' },
                { start: '12:00', end: '17:00', type: 'flat' },
            ], {
                peak: 1.5,
                flat: 1.0,
            });

            const result = calculateAveragePrice(
                [tariff],
                ['2024-01'],
                '08:00',
                '17:00'
            );

            expect(result).toHaveLength(1);
            const res = result[0];

            expect(res.totalHours).toBe(9);
            expect(res.avgPrice).toBeCloseTo(1.222222, 4);
            expect(res.details).toHaveLength(2);
            expect(res.details[0].type).toBe('peak');
            expect(res.details[0].hours).toBe(4);
            expect(res.details[1].type).toBe('flat');
            expect(res.details[1].hours).toBe(5);
        });

        it('handles cross-midnight calculations', () => {
            const tariff = createMockTariff('2024-01', [
                { start: '22:00', end: '06:00', type: 'valley' },
                { start: '06:00', end: '22:00', type: 'peak' },
            ], {
                valley: 0.5,
                peak: 1.5,
            });

            const result = calculateAveragePrice(
                [tariff],
                ['2024-01'],
                '22:00',
                '06:00'
            );

            expect(result).toHaveLength(1);
            const res = result[0];

            expect(res.totalHours).toBe(8);
            expect(res.avgPrice).toBeCloseTo(0.5, 4);
        });

        it('handles partial overlap with time rules', () => {
            const tariff = createMockTariff('2024-01', [
                { start: '08:00', end: '12:00', type: 'peak' },
                { start: '12:00', end: '18:00', type: 'flat' },
            ], {
                peak: 2.0,
                flat: 1.0,
            });

            const result = calculateAveragePrice(
                [tariff],
                ['2024-01'],
                '10:00',
                '16:00'
            );

            expect(result).toHaveLength(1);
            const res = result[0];

            expect(res.totalHours).toBe(6);
            expect(res.details[0].hours).toBe(2);
            expect(res.details[1].hours).toBe(4);
            expect(res.avgPrice).toBeCloseTo(1.333333, 4);
        });

        it('returns empty array when no tariff found', () => {
            const result = calculateAveragePrice([], ['2024-01'], '08:00', '17:00');
            expect(result).toHaveLength(0);
        });

        it('skips months with no tariff data', () => {
            const tariff = createMockTariff('2024-01', [
                { start: '08:00', end: '17:00', type: 'flat' },
            ], {
                flat: 1.0,
            });

            const result = calculateAveragePrice(
                [tariff],
                ['2024-01', '2024-02', '2024-03'],
                '08:00',
                '17:00'
            );

            expect(result).toHaveLength(1);
            expect(result[0].month).toBe('2024-01');
        });

        it('handles no overlap between user time and tariff rules', () => {
            const tariff = createMockTariff('2024-01', [
                { start: '08:00', end: '12:00', type: 'peak' },
            ], {
                peak: 1.5,
            });

            const result = calculateAveragePrice(
                [tariff],
                ['2024-01'],
                '14:00',
                '18:00'
            );

            expect(result).toHaveLength(0);
        });

        it('calculates correctly with all price types', () => {
            const tariff = createMockTariff('2024-01', [
                { start: '06:00', end: '08:00', type: 'tip' },
                { start: '08:00', end: '12:00', type: 'peak' },
                { start: '12:00', end: '16:00', type: 'flat' },
                { start: '16:00', end: '20:00', type: 'valley' },
                { start: '20:00', end: '22:00', type: 'deep' },
            ], {
                tip: 2.0,
                peak: 1.8,
                flat: 1.0,
                valley: 0.5,
                deep: 0.3,
            });

            const result = calculateAveragePrice(
                [tariff],
                ['2024-01'],
                '06:00',
                '22:00'
            );

            expect(result).toHaveLength(1);
            const res = result[0];

            expect(res.totalHours).toBe(16);
            expect(res.details).toHaveLength(5);
            expect(res.details[0].type).toBe('tip');
            expect(res.details[1].type).toBe('peak');
            expect(res.details[2].type).toBe('flat');
            expect(res.details[3].type).toBe('valley');
            expect(res.details[4].type).toBe('deep');
        });

        it('handles multiple months correctly', () => {
            const tariff1 = createMockTariff('2024-01', [
                { start: '08:00', end: '17:00', type: 'flat' },
            ], {
                flat: 1.0,
            });

            const tariff2 = createMockTariff('2024-02', [
                { start: '08:00', end: '17:00', type: 'flat' },
            ], {
                flat: 1.2,
            });

            const result = calculateAveragePrice(
                [tariff1, tariff2],
                ['2024-01', '2024-02'],
                '08:00',
                '17:00'
            );

            expect(result).toHaveLength(2);
            expect(result[0].month).toBe('2024-01');
            expect(result[0].avgPrice).toBeCloseTo(1.0, 4);
            expect(result[1].month).toBe('2024-02');
            expect(result[1].avgPrice).toBeCloseTo(1.2, 4);
        });
    });
});
