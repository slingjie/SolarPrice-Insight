
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pvgisService } from './pvgisService';
import { PVGISParams } from '../types';

// Mock DB
const { mockUpsert, mockFindOneExec } = vi.hoisted(() => {
    return {
        mockUpsert: vi.fn().mockResolvedValue({}),
        mockFindOneExec: vi.fn().mockResolvedValue(null)
    };
});

vi.mock('./db', () => ({
    getDatabase: vi.fn().mockReturnValue(Promise.resolve({
        pvgis_cache: {
            findOne: () => ({ exec: mockFindOneExec }),
            upsert: mockUpsert
        }
    }))
}));

// Mock Data
const MOCK_PARAMS: PVGISParams = {
    lat: 30,
    lon: 120,
    peakPower: 1, // 1 kWp
    loss: 14,
    azimuth: 0,
};

const MOCK_PVCALC_RESPONSE = {
    inputs: {
        mounting_system: {
            fixed: {
                slope: { value: 30 }
            }
        }
    },
    outputs: {
        totals: {
            fixed: {
                E_y: 1200, // 1200 kWh/year
                'H(i)_y': 1500, // 1500 kWh/m2
                l_total: '-20'
            }
        },
        monthly: {
            fixed: Array(12).fill(0).map((_, i) => ({
                month: i + 1,
                E_m: 100 // 100 kWh/month
            }))
        }
    }
};

const MOCK_MONTHLY_MR_RESPONSE = {
    outputs: {
        monthly: Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            'H(h)_m': 100 + i * 5
        }))
    }
};

const MOCK_SERIESCALC_HOURLY_RESPONSE = {
    outputs: {
        hourly: [
            { time: '20200101:0030', P: 1000, 'G(i)': 500 },
            { time: '20200101:0130', P: 2000, 'G(i)': 600 },
        ]
    }
};

const MOCK_SERIESCALC_MISSING_POWER_RESPONSE = {
    outputs: {
        hourly: [
            { time: '20200101:0030', P: null, 'G(i)': null },
            { time: '20200101:0130', P: 1500, 'G(i)': 400 },
        ]
    }
};

describe('pvgisService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset fetch mock
        global.fetch = vi.fn();
    });

    it('fetches summary and hourly data then caches it when cache misses', async () => {
        // Setup cache miss
        mockFindOneExec.mockResolvedValueOnce(null);

        // Setup successful fetch responses
        (global.fetch as any).mockImplementation(async (url: string) => {
            if (url.includes('PVcalc')) {
                return { ok: true, json: async () => MOCK_PVCALC_RESPONSE };
            }
            if (url.includes('MRcalc')) {
                return { ok: true, json: async () => MOCK_MONTHLY_MR_RESPONSE };
            }
            if (url.includes('seriescalc')) {
                return { ok: true, json: async () => MOCK_SERIESCALC_HOURLY_RESPONSE };
            }
            return { ok: false, statusText: 'unhandled url' };
        });

        const result = await pvgisService.getPVData(MOCK_PARAMS);

        // Verify Results
        expect(result.summary.annualEnergy).toBe(1200);
        expect(result.summary.fullLoadHours).toBe(1200); // 1200 kWh / 1 kWp
        // PR = (1200/1) / 1500 = 0.8
        expect(result.summary.pr).toBeCloseTo(0.8);
        expect(result.summary.optimalSlope).toBe(30);
        expect(result.hourly).toHaveLength(2);
        expect(result.hourly[0].pvPower).toBe(1000);
        expect(result.hourly[1].pvPower).toBe(2000);

        // Verify DB Cache Upsert
        expect(mockUpsert).toHaveBeenCalledTimes(1);
        expect((global.fetch as any).mock.calls.some(([url]: [string]) => url.includes('/seriescalc'))).toBe(true);
    });

    it('handles seriescalc data with missing power values gracefully', async () => {
        mockFindOneExec.mockResolvedValueOnce(null);

        (global.fetch as any).mockImplementation(async (url: string) => {
            if (url.includes('PVcalc')) {
                return { ok: true, json: async () => MOCK_PVCALC_RESPONSE };
            }
            if (url.includes('MRcalc')) {
                return { ok: true, json: async () => MOCK_MONTHLY_MR_RESPONSE };
            }
            if (url.includes('seriescalc')) {
                return { ok: true, json: async () => MOCK_SERIESCALC_MISSING_POWER_RESPONSE };
            }
            return { ok: false, statusText: 'unhandled url' };
        });

        const result = await pvgisService.getPVData(MOCK_PARAMS);
        expect(result.hourly).toHaveLength(2);
        expect(result.hourly[0].pvPower).toBe(0);
        expect(result.hourly[0].poaIrradiance).toBe(0);
        expect(result.hourly[1].pvPower).toBe(1500);
        expect(result.hourly[1].poaIrradiance).toBe(400);

        expect(mockUpsert).toHaveBeenCalledTimes(1);
    });

    it('should fetch separate optimal slope when angle is manually set', async () => {
        const MANUAL_PARAMS = { ...MOCK_PARAMS, angle: 15 };
        mockFindOneExec.mockResolvedValueOnce(null);

        const fetchMock = vi.fn(async (url: string) => {
            if (url.includes('/PVcalc')) {
                const parsed = new URL(url, 'http://localhost');
                const angle = parsed.searchParams.get('angle');
                const optimalInclination = parsed.searchParams.get('optimalinclination');
                if (angle === '15') {
                    return {
                        ok: true,
                        json: async () => ({
                            ...MOCK_PVCALC_RESPONSE,
                            inputs: { mounting_system: { fixed: { slope: { value: 15 } } } }
                        })
                    };
                }
                if (optimalInclination === '1' && !angle) {
                    return {
                        ok: true,
                        json: async () => ({
                            inputs: { mounting_system: { fixed: { slope: { value: 30 } } } }
                        })
                    };
                }
            }
            if (url.includes('MRcalc')) {
                return { ok: true, json: async () => MOCK_MONTHLY_MR_RESPONSE };
            }
            if (url.includes('seriescalc')) {
                return { ok: true, json: async () => MOCK_SERIESCALC_HOURLY_RESPONSE };
            }
            return { ok: false, statusText: 'Unknown URL' };
        });
        (global.fetch as any) = fetchMock;

        const result = await pvgisService.getPVData(MANUAL_PARAMS);

        expect(result.summary.optimalSlope).toBe(30); // Should be 30, not 15
        expect(result.summary.annualEnergy).toBe(1200); // From main call
        const pvcalcCalls = fetchMock.mock.calls.filter(([url]: [string]) => url.includes('/PVcalc'));
        expect(pvcalcCalls).toHaveLength(2);
        expect(pvcalcCalls.some(([url]: [string]) => url.includes('angle=15'))).toBe(true);
        expect(pvcalcCalls.some(([url]: [string]) => url.includes('optimalinclination=1'))).toBe(true);
    });

    it('should return cached data on cache hit', async () => {
        // Setup cache hit
        const cachedData = {
            id: 'some-hash',
            params: MOCK_PARAMS,
            summary: { annualEnergy: 9999, optimalSlope: 25 },
            hourly: [],
            created_at: Date.now() // Fresh
        };
        mockFindOneExec.mockResolvedValueOnce(cachedData);

        const result = await pvgisService.getPVData(MOCK_PARAMS);

        expect(result.summary.annualEnergy).toBe(9999);
        expect(result.summary.optimalSlope).toBe(25);
        expect(global.fetch).not.toHaveBeenCalled(); // No fetch
    });

    it('should throw error if PVcalc API fails', async () => {
        mockFindOneExec.mockResolvedValueOnce(null);

        // Mock fetch generically to avoid "undefined" if called more times/out of order
        (global.fetch as any).mockImplementation(async (url: string) => {
            if (url.includes('PVcalc')) {
                return { ok: false, statusText: 'Internal Server Error' };
            }
            if (url.includes('MRcalc')) {
                return { ok: true, json: async () => MOCK_MONTHLY_MR_RESPONSE };
            }
            if (url.includes('seriescalc')) {
                return { ok: true, json: async () => MOCK_SERIESCALC_HOURLY_RESPONSE };
            }
            return { ok: false };
        });

        await expect(pvgisService.getPVData(MOCK_PARAMS))
            .rejects.toThrow(/PVGIS (Series )?API Error/);
    });
});
