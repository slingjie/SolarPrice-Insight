import { describe, it, expect } from 'vitest';
import {
    simulateDailySolarCurve,
    simulateLoadCurve,
    calculateSelfConsumption,
} from './solarCalculator';

describe('solarCalculator', () => {
    describe('simulateDailySolarCurve', () => {
        it('should return 24 hourly values', () => {
            const curve = simulateDailySolarCurve(5);
            expect(curve).toHaveLength(24);
        });

        it('should all values be non-negative', () => {
            const curve = simulateDailySolarCurve(5);
            curve.forEach((value) => {
                expect(value).toBeGreaterThanOrEqual(0);
            });
        });

        it('should return values with sum roughly 3.5 * systemSize (25% tolerance)', () => {
            const systemSize = 5;
            const curve = simulateDailySolarCurve(systemSize);
            const sum = curve.reduce((acc, val) => acc + val, 0);

            const expected = 3.5 * systemSize;
            const tolerance = expected * 0.25;

            expect(sum).toBeGreaterThanOrEqual(expected - tolerance);
            expect(sum).toBeLessThanOrEqual(expected + tolerance);
        });

        it('should have peak around hour 12-13', () => {
            const curve = simulateDailySolarCurve(5);
            const maxValue = Math.max(...curve);
            const peakIndex = curve.indexOf(maxValue);

            expect(peakIndex).toBeGreaterThanOrEqual(11);
            expect(peakIndex).toBeLessThanOrEqual(13);
        });

        it('should apply seasonal factor correctly (summer vs winter)', () => {
            const systemSize = 10;
            const summerCurve = simulateDailySolarCurve(systemSize, 6);
            const winterCurve = simulateDailySolarCurve(systemSize, 1);

            const summerSum = summerCurve.reduce((acc, val) => acc + val, 0);
            const winterSum = winterCurve.reduce((acc, val) => acc + val, 0);

            const ratio = summerSum / winterSum;
            expect(ratio).toBeCloseTo(1.5, 1);
        });

        it('should have early morning and late evening values close to zero', () => {
            const curve = simulateDailySolarCurve(5);
            expect(curve[0]).toBeLessThan(0.01);
            expect(curve[23]).toBeLessThan(0.05);
        });
    });

    describe('simulateLoadCurve', () => {
        it('should return 24 hourly values', () => {
            const curve = simulateLoadCurve(600, '09:00', '17:00');
            expect(curve).toHaveLength(24);
        });

        it('should have all non-negative values', () => {
            const curve = simulateLoadCurve(600, '09:00', '17:00');
            curve.forEach((value) => {
                expect(value).toBeGreaterThanOrEqual(0);
            });
        });

        it('should have sum roughly equal to monthly / 30', () => {
            const monthly = 600;
            const curve = simulateLoadCurve(monthly, '09:00', '17:00');
            const sum = curve.reduce((acc, val) => acc + val, 0);

            const expected = monthly / 30;
            const tolerance = expected * 0.05;

            expect(sum).toBeGreaterThanOrEqual(expected - tolerance);
            expect(sum).toBeLessThanOrEqual(expected + tolerance);
        });

        it('should have higher load during working hours than non-working hours', () => {
            const workStart = 9;
            const workEnd = 17;
            const curve = simulateLoadCurve(600, '09:00', '17:00');

            let workingHourSum = 0;
            let nonWorkingHourSum = 0;

            for (let hour = 0; hour < 24; hour++) {
                if (hour >= workStart && hour < workEnd) {
                    workingHourSum += curve[hour];
                } else {
                    nonWorkingHourSum += curve[hour];
                }
            }

            expect(workingHourSum).toBeGreaterThan(nonWorkingHourSum);
        });

        it('should maintain constant baseload throughout the day', () => {
            const monthly = 600;
            const curve = simulateLoadCurve(monthly, '09:00', '17:00');

            const hour0Load = curve[0];
            const hour1Load = curve[1];
            const hour22Load = curve[22];
            const hour23Load = curve[23];

            expect(Math.abs(hour0Load - hour1Load)).toBeLessThan(hour0Load * 0.05);
            expect(Math.abs(hour22Load - hour23Load)).toBeLessThan(hour22Load * 0.05);
        });

        it('should handle different working hour ranges', () => {
            const earlyShift = simulateLoadCurve(600, '06:00', '14:00');
            const lateShift = simulateLoadCurve(600, '14:00', '22:00');

            let earlyShiftSum = 0;
            for (let hour = 6; hour < 14; hour++) {
                earlyShiftSum += earlyShift[hour];
            }

            let lateShiftSum = 0;
            for (let hour = 14; hour < 22; hour++) {
                lateShiftSum += lateShift[hour];
            }

            expect(earlyShiftSum).toBeGreaterThan(earlyShift.slice(14).reduce((a, b) => a + b));
            expect(lateShiftSum).toBeGreaterThan(lateShift.slice(0, 14).reduce((a, b) => a + b));
        });
    });

    describe('calculateSelfConsumption', () => {
        it('should return 24 hourly data entries', () => {
            const solar = simulateDailySolarCurve(5);
            const load = simulateLoadCurve(600, '09:00', '17:00');
            const result = calculateSelfConsumption(solar, load);

            expect(result.hourlyData).toHaveLength(24);
        });

        it('should have self + export == solar for each hour', () => {
            const solar = simulateDailySolarCurve(5);
            const load = simulateLoadCurve(600, '09:00', '17:00');
            const result = calculateSelfConsumption(solar, load);

            result.hourlyData.forEach((hourly) => {
                const solarBalance = hourly.selfConsumedKwh + hourly.exportKwh;
                expect(solarBalance).toBeCloseTo(hourly.solarKwh, 5);
            });
        });

        it('should have self + import == load for each hour', () => {
            const solar = simulateDailySolarCurve(5);
            const load = simulateLoadCurve(600, '09:00', '17:00');
            const result = calculateSelfConsumption(solar, load);

            result.hourlyData.forEach((hourly) => {
                const loadBalance = hourly.selfConsumedKwh + hourly.importKwh;
                expect(loadBalance).toBeCloseTo(hourly.loadKwh, 5);
            });
        });

        it('should calculate total aggregates correctly', () => {
            const solar = simulateDailySolarCurve(5);
            const load = simulateLoadCurve(600, '09:00', '17:00');
            const result = calculateSelfConsumption(solar, load);

            let sumSelfConsumed = 0;
            let sumExport = 0;
            let sumImport = 0;

            result.hourlyData.forEach((hourly) => {
                sumSelfConsumed += hourly.selfConsumedKwh;
                sumExport += hourly.exportKwh;
                sumImport += hourly.importKwh;
            });

            expect(result.totalSelfConsumedKwh).toBeCloseTo(sumSelfConsumed, 5);
            expect(result.totalExportKwh).toBeCloseTo(sumExport, 5);
            expect(result.totalImportKwh).toBeCloseTo(sumImport, 5);
        });

        it('should calculate self-consumption rate correctly', () => {
            const solar = simulateDailySolarCurve(5);
            const load = simulateLoadCurve(600, '09:00', '17:00');
            const result = calculateSelfConsumption(solar, load);

            const expectedRate = result.totalSelfConsumedKwh / solar.reduce((a, b) => a + b);
            expect(result.selfConsumptionRate).toBeCloseTo(expectedRate, 5);
        });

        it('should be between 0 and 1 for self-consumption rate', () => {
            const solar = simulateDailySolarCurve(5);
            const load = simulateLoadCurve(600, '09:00', '17:00');
            const result = calculateSelfConsumption(solar, load);

            expect(result.selfConsumptionRate).toBeGreaterThanOrEqual(0);
            expect(result.selfConsumptionRate).toBeLessThanOrEqual(1);
        });

        it('should handle case with perfect load match (all solar consumed)', () => {
            const solar: number[] = Array(24).fill(1);
            const load: number[] = Array(24).fill(1);

            const result = calculateSelfConsumption(solar, load);

            expect(result.selfConsumptionRate).toBeCloseTo(1.0, 5);
            expect(result.totalExportKwh).toBeCloseTo(0, 5);
            expect(result.totalImportKwh).toBeCloseTo(0, 5);
            expect(result.totalSelfConsumedKwh).toBeCloseTo(24, 5);
        });

        it('should handle case with excess solar (export)', () => {
            const solar: number[] = Array(24).fill(5);
            const load: number[] = Array(24).fill(2);

            const result = calculateSelfConsumption(solar, load);

            expect(result.totalExportKwh).toBeGreaterThan(0);
            expect(result.totalImportKwh).toBeCloseTo(0, 5);
            expect(result.totalSelfConsumedKwh).toBeCloseTo(48, 5);
            expect(result.totalExportKwh).toBeCloseTo(72, 5);
        });

        it('should handle case with low solar (import needed)', () => {
            const solar: number[] = Array(24).fill(1);
            const load: number[] = Array(24).fill(4);

            const result = calculateSelfConsumption(solar, load);

            expect(result.totalImportKwh).toBeGreaterThan(0);
            expect(result.totalExportKwh).toBeCloseTo(0, 5);
            expect(result.totalSelfConsumedKwh).toBeCloseTo(24, 5);
            expect(result.totalImportKwh).toBeCloseTo(72, 5);
        });

        it('should handle peak solar with off-peak load', () => {
            const solar: number[] = [
                0, 0, 0, 0, 0, 0.5, 1, 2, 3, 4, 5, 6,
                6.5, 6, 5, 4, 3, 2, 1, 0.5, 0, 0, 0, 0,
            ];
            const load: number[] = [
                1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3,
                3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1, 1,
            ];

            const result = calculateSelfConsumption(solar, load);

            expect(result.totalSelfConsumedKwh).toBeGreaterThan(0);
            expect(result.totalImportKwh).toBeGreaterThan(0);

            expect(result.totalSelfConsumedKwh + result.totalExportKwh).toBeCloseTo(
                solar.reduce((a, b) => a + b),
                5,
            );
            expect(result.totalSelfConsumedKwh + result.totalImportKwh).toBeCloseTo(
                load.reduce((a, b) => a + b),
                5,
            );
        });

        it('should verify conservation laws hold for realistic simulation', () => {
            const solar = simulateDailySolarCurve(10);
            const load = simulateLoadCurve(1000, '08:00', '18:00');
            const result = calculateSelfConsumption(solar, load);

            const totalSolar = solar.reduce((a, b) => a + b);
            expect(result.totalSelfConsumedKwh + result.totalExportKwh).toBeCloseTo(
                totalSolar,
                5,
            );

            const totalLoad = load.reduce((a, b) => a + b);
            expect(result.totalSelfConsumedKwh + result.totalImportKwh).toBeCloseTo(
                totalLoad,
                5,
            );
        });
    });
});
