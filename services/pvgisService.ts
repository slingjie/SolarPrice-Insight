
import { PVGISParams, PVSummary, HourlyData, PVGISCacheData, IrradiancePoint, IrradianceResponse } from '../types';
import { getDatabase } from './db';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = '/api/pvgis'; // Uses Vite Proxy
const CACHE_VERSION = 'v2_ghi_fix'; // Increment to invalidate cache

/**
 * Calculate SHA-256 hash for params to use as cache key
 */
async function generateCacheKey(params: PVGISParams): Promise<string> {
    const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
        acc[key] = params[key as keyof PVGISParams];
        return acc;
    }, {} as any);
    const msgBuffer = new TextEncoder().encode(JSON.stringify(sortedParams) + CACHE_VERSION);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Fetch Optimal Slope from PVGIS
 */
async function getOptimalSlope(lat: number, lon: number): Promise<number | null> {
    const query = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        peakpower: '1',
        loss: '0',
        optimalinclination: '1',
        outputformat: 'json',
    });

    try {
        const response = await fetch(`${API_BASE_URL}/PVcalc?${query.toString()}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.inputs?.mounting_system?.fixed?.slope?.value ?? null;
    } catch (e) {
        console.warn('Failed to fetch optimal slope', e);
        return null;
    }
}

/**
 * Fetch Monthly Radiation (for Horizontal Irradiance) using MRcalc
 */
async function fetchMonthlyRadiation(params: PVGISParams): Promise<number> {
    const query = new URLSearchParams({
        lat: params.lat.toString(),
        lon: params.lon.toString(),
        horirrad: '1',
        outputformat: 'json'
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
    // IMPORTANT: Check for undefined/null, as 0 is a valid angle!
    if (params.angle === undefined || params.angle === null) {
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

    const H_i_y = outputs.totals.fixed['H(i)_y']; // In-plane
    const pr = H_i_y ? (annualEnergy / params.peakPower) / H_i_y : 0;

    // [Updated] Priority: Use MRcalc (horizontalIrradiance) if available to ensure consistency with Irradiance Query page.
    // Fallback to PVcalc summation if MRcalc fails.
    let calcGHI = 0;
    const monthlyList = outputs.monthly?.fixed || outputs.monthly;
    if (Array.isArray(monthlyList)) {
        calcGHI = monthlyList.reduce((sum: number, m: any) => sum + (m['H(h)_m'] || 0), 0);
        if (calcGHI === 0 && (params.angle === 0 || params.angle === undefined)) {
            calcGHI = monthlyList.reduce((sum: number, m: any) => sum + (m['H(i)_m'] || 0), 0);
        }
    }
    const finalGHI = horizontalIrradiance > 0 ? horizontalIrradiance : calcGHI;

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
        globalIrradiance: finalGHI, // Use the one summed from PVcalc matching the same params
        inPlaneIrradiance: H_i_y || 0
    };
}

/**
 * Fetch Hourly Data using TMY (Typical Meteorological Year)
 * Changed from seriescalc(2020) to tmy to align with Irradiance Query results
 */
async function fetchHourlyData(params: PVGISParams): Promise<HourlyData[]> {
    const query = new URLSearchParams({
        lat: params.lat.toString(),
        lon: params.lon.toString(),
        peakpower: params.peakPower.toString(),
        loss: params.loss.toString(),
        outputformat: 'json',
        pvcalculation: '1', // Include PV output in TMY
    });

    if (params.angle !== undefined) {
        query.append('angle', params.angle.toString());
    } else {
        query.append('optimalinclination', '1');
    }

    if (params.azimuth !== undefined) {
        query.append('aspect', params.azimuth.toString());
    }


    const response = await fetch(`${API_BASE_URL}/tmy?${query.toString()}`);
    if (!response.ok) {
        throw new Error(`PVGIS API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const hourly = data.outputs.tmy_hourly;

    if (!hourly) {
        throw new Error('No hourly data returned from PVGIS TMY');
    }

    return hourly.map((h: any) => ({
        time: parsePvgisTimeToIsoUtc(h['time(UTC)']),
        pvPower: h.P ?? 0, // Watts
        poaIrradiance: h['G(i)'] ?? 0, // W/m2 In-plane irradiance
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
    },

    /**
     * 获取 TMY 典型年数据 (8760 小时辐照度)
     * @param lat 纬度
     * @param lon 经度
     */
    async getTMYData(lat: number, lon: number): Promise<IrradianceResponse> {
        const query = new URLSearchParams({
            lat: lat.toString(),
            lon: lon.toString(),
            outputformat: 'json',
        });

        const requestUrl = `${API_BASE_URL}/tmy?${query.toString()}`;
        const response = await fetch(requestUrl);

        if (!response.ok) {
            throw new Error(`PVGIS TMY API Error: ${response.statusText}`);
        }

        const json = await response.json();
        const rows = json.outputs?.tmy_hourly ?? [];

        const data: IrradiancePoint[] = rows.map((r: any) => {
            const rawTime = r['time(UTC)'];
            if (typeof rawTime !== 'string') throw new Error('PVGIS TMY missing time(UTC)');

            const ghi = numberOrNull(r['G(h)']);
            const dni = numberOrNull(r['Gb(n)']);
            const dhi = numberOrNull(r['Gd(h)']);

            const skip = new Set(['time(UTC)', 'G(h)', 'Gb(n)', 'Gd(h)']);
            const extras: Record<string, number | string | null> = {};
            for (const [k, v] of Object.entries(r)) {
                if (!skip.has(k)) extras[k] = v as any;
            }

            return {
                time: parsePvgisTimeToIsoUtc(rawTime),
                ghi,
                dni,
                dhi,
                extras,
            };
        });

        return {
            metadata: {
                source: 'pvgis',
                queryType: 'tmy',
                lat,
                lon,
                timeRef: 'UTC',
                unit: { irradiance: 'W/m2' },
                requestUrl: `https://re.jrc.ec.europa.eu/api/v5_2/tmy?${query.toString()}`,
                rawInputs: json.inputs,
            },
            data,
        };
    },

    /**
     * 获取辐照度序列数据 (按年度)
     * @param lat 纬度
     * @param lon 经度
     * @param startYear 开始年份
     * @param endYear 结束年份
     */
    async getIrradianceSeries(lat: number, lon: number, startYear: number, endYear: number): Promise<IrradianceResponse> {
        const query = new URLSearchParams({
            lat: lat.toString(),
            lon: lon.toString(),
            startyear: startYear.toString(),
            endyear: endYear.toString(),
            outputformat: 'json',
            browser: '0',
            components: '1',
        });

        const requestUrl = `${API_BASE_URL}/seriescalc?${query.toString()}`;
        const response = await fetch(requestUrl);

        if (!response.ok) {
            throw new Error(`PVGIS Series API Error: ${response.statusText}`);
        }

        const json = await response.json();
        const rows = json.outputs?.hourly ?? [];

        const data: IrradiancePoint[] = rows.map((r: any) => {
            const rawTime = r.time;
            if (typeof rawTime !== 'string') throw new Error('PVGIS series missing time');

            // For seriescalc with components=1, PVGIS returns Gb(i), Gd(i), Gr(i)
            const gb = numberOrNull(r['Gb(i)']);
            const gd = numberOrNull(r['Gd(i)']);
            const gr = numberOrNull(r['Gr(i)']);
            const ghi = gb !== null || gd !== null || gr !== null
                ? (gb ?? 0) + (gd ?? 0) + (gr ?? 0)
                : null;

            const skip = new Set(['time']);
            const extras: Record<string, number | string | null> = {};
            for (const [k, v] of Object.entries(r)) {
                if (!skip.has(k)) extras[k] = v as any;
            }

            return {
                time: parsePVGISTime(rawTime),
                ghi,
                dni: null,
                dhi: null,
                extras,
            };
        });

        return {
            metadata: {
                source: 'pvgis',
                queryType: 'series',
                lat,
                lon,
                timeRef: 'UTC',
                unit: { irradiance: 'W/m2' },
                requestUrl: `https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?${query.toString()}`,
                rawInputs: json.inputs,
            },
            data,
        };
    },

    // [NEW] Exposed methods
    getOptimalSlope,
    fetchMonthlyRadiation,
};

// ========== 辅助函数 ==========

function numberOrNull(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * 解析 PVGIS TMY 时间格式 "20050101:0010" 到 ISO UTC
 */
function parsePvgisTimeToIsoUtc(raw: string): string {
    // Format: "20050101:0010" -> "2005-01-01T00:10:00Z"
    const year = raw.substring(0, 4);
    const month = raw.substring(4, 6);
    const day = raw.substring(6, 8);
    const hour = raw.substring(9, 11);
    const minute = raw.substring(11, 13);
    return `${year}-${month}-${day}T${hour}:${minute}:00Z`;
}

