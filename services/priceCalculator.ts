import { TariffData, TimeType } from '../types';

/**
 * Convert time string "HH:MM" to minutes from midnight
 * @param time - Time in "HH:MM" format
 * @returns Minutes from midnight (0-1440)
 */
export const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

/**
 * Calculate overlap between two time ranges in minutes
 * @param start1 - Start of first range (in minutes)
 * @param end1 - End of first range (in minutes)
 * @param start2 - Start of second range (in minutes)
 * @param end2 - End of second range (in minutes)
 * @returns Overlap duration in minutes
 */
export const getOverlapMinutes = (
    start1: number,
    end1: number,
    start2: number,
    end2: number
): number => {
    const maxStart = Math.max(start1, start2);
    const minEnd = Math.min(end1, end2);
    return Math.max(0, minEnd - maxStart);
};

/**
 * Split a time range into segments within [0, 1440] minutes
 * Handles cross-midnight scenarios
 * @param start - Start time in "HH:MM" format
 * @param end - End time in "HH:MM" format
 * @returns Array of [startMin, endMin] segments
 */
export const getTimeSegments = (
    start: string,
    end: string
): Array<[number, number]> => {
    const startMins = timeToMinutes(start);
    let endMins = timeToMinutes(end);

    // Handle "00:00" as "24:00" if it's an end time (common for rules like 17:00-00:00)
    if (endMins === 0 && startMins !== 0) endMins = 1440;

    if (endMins < startMins) {
        // Over midnight: e.g. 22:00 - 02:00 -> [1320, 1440] and [0, endMins]
        return [
            [startMins, 1440],
            [0, endMins],
        ];
    }
    return [[startMins, endMins]];
};

/**
 * Breakdown of price details for a single time period
 */
export interface PriceBreakdown {
    type: TimeType;
    price: number;
    hours: number;
    cost: number; // price * hours
}

/**
 * Result of average price calculation for a single month
 */
export interface CalculationResult {
    month: string;
    startTime: string;
    endTime: string;
    avgPrice: number;
    details: PriceBreakdown[];
    totalHours: number;
}

/**
 * Calculate average price for given time period and months
 * @param tariffs - Array of tariff data for the province/category/voltage
 * @param months - Array of months to calculate (YYYY-MM format)
 * @param startTime - Start time in "HH:MM" format
 * @param endTime - End time in "HH:MM" format
 * @returns Array of calculation results, one per month
 */
export const calculateAveragePrice = (
    tariffs: TariffData[],
    months: string[],
    startTime: string,
    endTime: string
): CalculationResult[] => {
    const userSegments = getTimeSegments(startTime, endTime);
    const results: CalculationResult[] = [];

    months.forEach((month) => {
        // Find the tariff for this month (should be unique by month if already filtered)
        const tariff = tariffs.find((t) => t.month === month);

        if (!tariff) return;

        let totalWeightedPrice = 0;
        let totalOverlapMinutes = 0;
        const typeAccumulator: Record<
            string,
            { type: TimeType; price: number; totalMinutes: number }
        > = {};

        // Process each time rule in the tariff
        tariff.time_rules.forEach((rule) => {
            const ruleSegments = getTimeSegments(rule.start, rule.end);
            const price = tariff.prices[rule.type as keyof typeof tariff.prices] || 0;

            // Find overlap between user's time window and this rule
            userSegments.forEach((uSeg) => {
                ruleSegments.forEach((rSeg) => {
                    const overlap = getOverlapMinutes(
                        uSeg[0],
                        uSeg[1],
                        rSeg[0],
                        rSeg[1]
                    );
                    if (overlap > 0) {
                        totalWeightedPrice += price * overlap;
                        totalOverlapMinutes += overlap;

                        if (!typeAccumulator[rule.type]) {
                            typeAccumulator[rule.type] = {
                                type: rule.type as TimeType,
                                price,
                                totalMinutes: 0,
                            };
                        }
                        typeAccumulator[rule.type].totalMinutes += overlap;
                    }
                });
            });
        });

        // Only add result if there's valid overlap
        if (totalOverlapMinutes > 0) {
            const breakdown = Object.values(typeAccumulator)
                .sort((a, b) => {
                    const order = ['tip', 'peak', 'flat', 'valley', 'deep'];
                    return order.indexOf(a.type) - order.indexOf(b.type);
                })
                .map((item) => ({
                    type: item.type,
                    price: item.price,
                    hours: item.totalMinutes / 60,
                    cost: item.price * (item.totalMinutes / 60),
                }));

            results.push({
                month: month,
                startTime: startTime,
                endTime: endTime,
                avgPrice: totalWeightedPrice / totalOverlapMinutes,
                details: breakdown,
                totalHours: totalOverlapMinutes / 60,
            });
        }
    });

    return results;
};
