
import { PVGISParams, PVSummary, HourlyData, PVGISCacheData } from '../types';
import { getDatabase } from './db';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = '/api/pvgis'; // Uses Vite Proxy

/**
 * Calculate SHA-256 hash for params to use as cache key
 */
async function generateCacheKey(params: PVGISParams): Promise<string> {
    const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
        acc[key] = params[key as keyof PVGISParams];
        return acc;
    }, {} as any);
    const msgBuffer = new TextEncoder().encode(JSON.stringify(sortedParams));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Fetch Monthly Radiation (for Horizontal Irradiance) using MRcalc
 */
async function fetchMonthlyRadiation(params: PVGISParams): Promise<number> {
    const query = new URLSearchParams({
        lat: params.lat.toString(),
        lon: params.lon.toString(),
        horirrad: '1',
        outputformat: 'json',
        startyear: '2016', // Use a recent representative range or leave empty for full range
        endyear: '2020'
    });

    try {
        const response = await fetch(`${API_BASE_URL}/MRcalc?${query.toString()}`);
        if (!response || !response.ok) {
            console.warn('MRcalc fetch failed, defaulting to 0');
            return 0;
        }
        const data = await response.json();
        const monthly = data?.outputs?.monthly; // Safe access
        if (!monthly) return 0;

        // Sum up monthly H(h)_m to get annual H(h)_y
        // Note: MRcalc returns time-series (multiple years). We should average it or take the sum of averages.
        // Actually MRcalc output 'monthly' contains all months of all years. 
        // We need to calculate the average annual sum.

        let totalSum = 0;
        let count = 0;
        monthly.forEach((m: any) => {
            if (m['H(h)_m']) {
                totalSum += m['H(h)_m'];
                count++;
            }
        });

        // Annual Average = (Total Sum / Count) * 12
        return count > 0 ? (totalSum / count) * 12 : 0;

    } catch (e) {
        console.warn('Error fetching monthly radiation', e);
        return 0;
    }
}

/**
 * Fetch PVGIS Summary (Monthly/Annual) using PVcalc
 */
async function fetchPVSummary(params: PVGISParams): Promise<PVSummary> {
    const query = new URLSearchParams({
        lat: params.lat.toString(),
        lon: params.lon.toString(),
        peakpower: params.peakPower.toString(),
        loss: params.loss.toString(),
        outputformat: 'json',
        aspect: params.azimuth.toString(),
    });

    // Check if we need to optimize slope (angle)
    if (!params.angle) {
        query.append('optimalinclination', '1');
    } else {
        query.append('angle', params.angle.toString());
    }

    const [pvResponse, horizontalIrradiance] = await Promise.all([
        fetch(`${API_BASE_URL}/PVcalc?${query.toString()}`),
        fetchMonthlyRadiation(params)
    ]);

    if (!pvResponse.ok) {
        throw new Error(`PVGIS API Error: ${pvResponse.statusText}`);
    }

    const data = await pvResponse.json();
    const outputs = data.outputs;

    if (!outputs || !outputs.monthly || !outputs.totals) {
        throw new Error('Invalid PVGIS response format');
    }

    const monthlyEnergy = outputs.monthly.fixed.map((m: any) => m.E_m);
    const annualEnergy = outputs.totals.fixed.E_y;
    const loss = parseFloat(outputs.totals.fixed.l_total || '0');
    // Full Load Hours = E_y / peakPower
    const fullLoadHours = annualEnergy / params.peakPower;

    const H_i_y = outputs.totals.fixed['H(i)_y'];
    const pr = H_i_y ? (annualEnergy / params.peakPower) / H_i_y : 0;

    // Extract Optimal Slope
    let optimalSlope = 0;

    if (!params.angle) {
        // If we used optimalinclination=1, input metadata has it.
        optimalSlope = data.inputs.mounting_system?.fixed?.slope?.value || 0;
    } else {
        // If manual angle was used, we need to fetch the optimal slope separately to display it correctly
        try {
            const optQuery = new URLSearchParams({
                lat: params.lat.toString(),
                lon: params.lon.toString(),
                peakpower: params.peakPower.toString(),
                loss: params.loss.toString(),
                outputformat: 'json',
                aspect: params.azimuth.toString(),
                optimalinclination: '1'
            });
            const optResponse = await fetch(`${API_BASE_URL}/PVcalc?${optQuery.toString()}`);
            if (optResponse.ok) {
                const optData = await optResponse.json();
                optimalSlope = optData.inputs.mounting_system?.fixed?.slope?.value || 0;
            } else {
                // Fallback to current angle if fetch fails, though not ideal
                optimalSlope = params.angle || 0;
            }
        } catch (e) {
            console.warn('Failed to fetch separate optimal slope', e);
            optimalSlope = params.angle || 0;
        }
    }

    return {
        annualEnergy,
        monthlyEnergy,
        fullLoadHours,
        pr,
        loss,
        optimalSlope,
        globalIrradiance: horizontalIrradiance, // From MRcalc
        inPlaneIrradiance: H_i_y || 0
    };
}

/**
 * Fetch Hourly Data using seriescalc
 * Uses a recent representative year (2020) because PVcalc doesn't support hourly TMY via API easily.
 */
async function fetchHourlyData(params: PVGISParams): Promise<HourlyData[]> {
    const query = new URLSearchParams({
        lat: params.lat.toString(),
        lon: params.lon.toString(),
        peakpower: params.peakPower.toString(),
        loss: params.loss.toString(),
        outputformat: 'json',
        pvcalculation: '1', // Important for seriescalc to return P
        startyear: '2020',
        endyear: '2020',
        aspect: params.azimuth.toString(),
    });

    if (!params.angle) {
        query.append('optimalinclination', '1');
    } else {
        query.append('angle', params.angle.toString());
    }

    const response = await fetch(`${API_BASE_URL}/seriescalc?${query.toString()}`);
    if (!response.ok) {
        throw new Error(`PVGIS API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const hourly = data.outputs.hourly;

    if (!hourly) {
        throw new Error('No hourly data returned from PVGIS');
    }

    return hourly.map((h: any) => ({
        time: parsePVGISTime(h.time),
        pvPower: h.P, // Watts
        poaIrradiance: h['G(i)'], // W/m2
    }));
}

/**
 * Helper to parse PVGIS time string "YYYYMMDD:HHMM" to ISO string
 */
function parsePVGISTime(timeStr: string): string {
    // Format: 20201228:1910
    const year = timeStr.substring(0, 4);
    const month = timeStr.substring(4, 6);
    const day = timeStr.substring(6, 8);
    const hour = timeStr.substring(9, 11);
    const minute = timeStr.substring(11, 13);
    return `${year}-${month}-${day}T${hour}:${minute}:00.000Z`; // Assume UTC
}

export const pvgisService = {
    /**
     * Get PVGIS Data (Summary + Hourly) with Caching
     */
    async getPVData(params: PVGISParams): Promise<{ summary: PVSummary, hourly: HourlyData[] }> {
        const db = await getDatabase();
        const cacheKey = await generateCacheKey(params);

        // Try Cache
        const cached = await db.pvgis_cache.findOne(cacheKey).exec();
        if (cached) {
            // Optional: Check TTL (e.g., 30 days)
            const age = Date.now() - cached.created_at;
            if (age < 30 * 24 * 60 * 60 * 1000) {
                return {
                    summary: cached.summary as PVSummary,
                    hourly: cached.hourly as HourlyData[]
                };
            }
        }

        // Fetch from API
        const [summary, hourly] = await Promise.all([
            fetchPVSummary(params),
            fetchHourlyData(params)
        ]);

        // Save to Cache
        await db.pvgis_cache.upsert({
            id: cacheKey,
            params,
            summary,
            hourly,
            created_at: Date.now(),
            _deleted: false
        });

        return { summary, hourly };
    }
};
