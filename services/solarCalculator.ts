import { SolarSimulationResult, SelfConsumptionHourlyData, TariffData, TimeRule } from '../types';

const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

/**
 * Result of financial savings calculation
 */
export interface FinancialSavingsResult {
    totalSavings: number; // Total avoided cost from self-consumption (currency units)
    totalRevenue: number; // Total revenue from grid export (currency units)
    totalCost: number; // Total cost of grid import (currency units)
    hourlyDetails: Array<{
        hour: number;
        selfConsumedKwh: number;
        savingsPrice: number; // Grid price at this hour
        savings: number;
        exportKwh: number;
        feedInTariff: number;
        revenue: number;
        importKwh: number;
        importPrice: number;
        importCost: number;
    }>;
}

/**
 * Calculate financial savings from self-consumption using tariff data
 * Matches hourly data with tariff prices and calculates avoided costs
 * 
 * @param hourlyData - 24 hourly self-consumption data points
 * @param tariffs - Tariff data for the month (filtered by province/category)
 * @param feedInTariff - Feed-in tariff rate for exported energy (default 0.35)
 * @returns FinancialSavingsResult with total savings, revenue, and hourly breakdown
 */
export const calculateFinancialSavings = (
    hourlyData: SelfConsumptionHourlyData[],
    tariffs: TariffData[],
    feedInTariff: number = 0.35
): FinancialSavingsResult => {
    let totalSavings = 0;
    let totalRevenue = 0;
    let totalCost = 0;

    const hourlyDetails = hourlyData.map((hour) => {
        // Find price for this hour from tariffs
        const hourStart = `${String(hour.hour).padStart(2, '0')}:00`;
        const hourEnd = `${String(hour.hour + 1).padStart(2, '0')}:00`;
        const hourStartMin = hour.hour * 60;
        
        // Get price for this hour by checking all tariffs and time rules
        let savingsPrice = 0;
        let importPrice = 0;

        // Iterate through tariffs to find matching time rules
        tariffs.forEach((tariff) => {
            tariff.time_rules.forEach((rule) => {
                const ruleStartMin = timeToMinutes(rule.start);
                const ruleEndMin = timeToMinutes(rule.end);
                
                // Handle end time "00:00" as "24:00"
                const adjustedEndMin = ruleEndMin === 0 && ruleStartMin !== 0 ? 1440 : ruleEndMin;
                
                // Check if hour falls within this rule (simple hour matching)
                const isMatch = ruleStartMin <= hourStartMin && hourStartMin < adjustedEndMin;
                
                if (isMatch) {
                    const price = tariff.prices[rule.type as keyof typeof tariff.prices] || 0;
                    // Use first matching price found
                    if (savingsPrice === 0) {
                        savingsPrice = price;
                        importPrice = price;
                    }
                }
            });
        });

        // If no matching tariff found, use average of all available prices
        if (savingsPrice === 0 && tariffs.length > 0) {
            const allPrices: number[] = [];
            tariffs.forEach((t) => {
                Object.values(t.prices).forEach((p) => {
                    if (typeof p === 'number' && p > 0) allPrices.push(p);
                });
            });
            savingsPrice = allPrices.length > 0 ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : 0;
            importPrice = savingsPrice;
        }

        const hourSavings = hour.selfConsumedKwh * savingsPrice;
        const hourRevenue = hour.exportKwh * feedInTariff;
        const hourImportCost = hour.importKwh * importPrice;

        totalSavings += hourSavings;
        totalRevenue += hourRevenue;
        totalCost += hourImportCost;

        return {
            hour: hour.hour,
            selfConsumedKwh: hour.selfConsumedKwh,
            savingsPrice,
            savings: hourSavings,
            exportKwh: hour.exportKwh,
            feedInTariff,
            revenue: hourRevenue,
            importKwh: hour.importKwh,
            importPrice,
            importCost: hourImportCost,
        };
    });

    return {
        totalSavings,
        totalRevenue,
        totalCost,
        hourlyDetails,
    };
};



/**
 * Get seasonal adjustment factor based on month
 * Summer (6-8): 1.2x, Winter (12,1,2): 0.8x, Others: 1.0x
 * @param month - Month number 1-12
 * @returns Seasonal adjustment factor
 */
const getSeasonalFactor = (month: number): number => {
    if (month >= 6 && month <= 8) return 1.2; // Summer
    if (month === 12 || month === 1 || month === 2) return 0.8; // Winter
    return 1.0; // Spring/Fall
};

/**
 * Gaussian (Normal distribution) curve for solar generation
 * @param hour - Hour 0-23
 * @param peak - Peak hour (default 12.5 for 12:30)
 * @param stdDev - Standard deviation (default 3)
 * @returns Normalized value 0-1
 */
const gaussianCurve = (hour: number, peak: number = 12.5, stdDev: number = 3): number => {
    const exponent = -Math.pow(hour - peak, 2) / (2 * Math.pow(stdDev, 2));
    return Math.exp(exponent);
};

/**
 * Simulate hourly solar generation curve for a day
 * Uses Gaussian distribution peaking around 12:30 PM
 * 
 * @param systemSizeKw - System capacity in kW
 * @param month - Month number 1-12 (optional, for seasonal adjustment)
 * @returns Array of 24 hourly generation values in kWh
 */
export const simulateDailySolarCurve = (
    systemSizeKw: number,
    month: number = 6 // Default to summer (June) for 3.5 kWh/kWp baseline
): number[] => {
    // Daily average generation: 3.5 kWh per kWp per day
    const dailyGeneration = 3.5 * systemSizeKw;
    
    // Apply seasonal adjustment
    const seasonalFactor = getSeasonalFactor(month);
    const adjustedDailyGeneration = dailyGeneration * seasonalFactor;

    // Generate Gaussian curve for 24 hours
    const curve: number[] = [];
    let totalArea = 0;

    for (let hour = 0; hour < 24; hour++) {
        const value = gaussianCurve(hour, 12.5, 3.5);
        curve.push(value);
        totalArea += value;
    }

    // Normalize to match target daily generation
    // Assuming sunlight hours roughly 6-18 (12 hours), integrate over that range
    const normalizedCurve = curve.map((value) => {
        // Scale such that sum matches adjustedDailyGeneration
        return (value / totalArea) * adjustedDailyGeneration;
    });

    return normalizedCurve;
};

/**
 * Simulate hourly load consumption curve for a day
 * 
 * @param monthlyConsumptionKwh - Monthly consumption in kWh
 * @param workStartHour - Work start time in "HH:mm" format
 * @param workEndHour - Work end time in "HH:mm" format
 * @returns Array of 24 hourly load values in kWh
 */
export const simulateLoadCurve = (
    monthlyConsumptionKwh: number,
    workStartHour: string,
    workEndHour: string
): number[] => {
    // Daily average consumption
    const dailyConsumption = monthlyConsumptionKwh / 30;

    // Convert times to minutes for easier calculation
    const workStartMin = timeToMinutes(workStartHour);
    const workEndMin = timeToMinutes(workEndHour);
    const workDurationHours = (workEndMin - workStartMin) / 60;

    // Distribution: 70% during working hours, 30% baseload during non-working
    const workingLoadFraction = 0.7;
    const baseloadFraction = 0.3;

    const workingHourlyLoad = (dailyConsumption * workingLoadFraction) / (workDurationHours || 1);
    const baseloadHourlyLoad = (dailyConsumption * baseloadFraction) / 24;

    const curve: number[] = [];

    for (let hour = 0; hour < 24; hour++) {
        const minuteFromStart = hour * 60;
        let load = baseloadHourlyLoad;

        // Add working hour load if current hour is within working period
        if (minuteFromStart >= workStartMin && minuteFromStart < workEndMin) {
            load = workingHourlyLoad + baseloadHourlyLoad;
        }

        curve.push(load);
    }

    return curve;
};

/**
 * Calculate self-consumption balance between solar generation and load
 * 
 * @param solarCurve - Array of 24 hourly solar generation values (kWh)
 * @param loadCurve - Array of 24 hourly load values (kWh)
 * @returns SolarSimulationResult with aggregated totals and hourly details
 */
export const calculateSelfConsumption = (
    solarCurve: number[],
    loadCurve: number[]
): SolarSimulationResult => {
    let totalSelfConsumed = 0;
    let totalExport = 0;
    let totalImport = 0;

    const hourlyData: SelfConsumptionHourlyData[] = [];

    for (let hour = 0; hour < 24; hour++) {
        const solar = solarCurve[hour];
        const load = loadCurve[hour];

        // Self-consumed: minimum of solar and load
        const selfConsumed = Math.min(solar, load);

        // Export: excess solar
        const exportEnergy = Math.max(0, solar - load);

        // Import: deficit (when load > solar)
        const importEnergy = Math.max(0, load - solar);

        totalSelfConsumed += selfConsumed;
        totalExport += exportEnergy;
        totalImport += importEnergy;

        hourlyData.push({
            hour,
            solarKwh: solar,
            loadKwh: load,
            selfConsumedKwh: selfConsumed,
            exportKwh: exportEnergy,
            importKwh: importEnergy,
        });
    }

    // Calculate self-consumption rate (0-1)
    const totalSolar = solarCurve.reduce((sum, val) => sum + val, 0);
    const selfConsumptionRate = totalSolar > 0 ? totalSelfConsumed / totalSolar : 0;

    return {
        selfConsumptionRate,
        totalSelfConsumedKwh: totalSelfConsumed,
        totalExportKwh: totalExport,
        totalImportKwh: totalImport,
        hourlyData,
    };
};
