
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

const MOCK_SERIESCALC_RESPONSE = {
    outputs: {
        hourly: [
            { time: "20200101:1000", P: 500, "G(i)": 600 },
            { time: "20200101:1100", P: 800, "G(i)": 900 },
        ]
    }
};

describe('pvgisService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset fetch mock
        global.fetch = vi.fn();
    });

    it('should fetch data from API on cache miss and save to db', async () => {
        // Setup cache miss
        mockFindOneExec.mockResolvedValueOnce(null);

        // Setup successful fetch responses
        (global.fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => MOCK_PVCALC_RESPONSE // PVcalc
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ outputs: { monthly: [] } }) // MRcalc
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => MOCK_SERIESCALC_RESPONSE // seriescalc
            });

        const result = await pvgisService.getPVData(MOCK_PARAMS);

        // Verify Results
        expect(result.summary.annualEnergy).toBe(1200);
        expect(result.summary.fullLoadHours).toBe(1200); // 1200 kWh / 1 kWp
        // PR = (1200/1) / 1500 = 0.8
        expect(result.summary.pr).toBeCloseTo(0.8);
        expect(result.summary.optimalSlope).toBe(30);
        expect(result.hourly).toHaveLength(2);
        expect(result.hourly[0].pvPower).toBe(500);

        // Verify DB Cache Upsert
        expect(mockUpsert).toHaveBeenCalledTimes(1);
    });

    it('should fetch separate optimal slope when angle is manually set', async () => {
        const MANUAL_PARAMS = { ...MOCK_PARAMS, angle: 15 };
        mockFindOneExec.mockResolvedValueOnce(null);

        (global.fetch as any).mockImplementation(async (url: string) => {
            if (url.includes('optimalinclination=1') && url.includes('aspect=')) {
                // This is the separate optimal slope fetch (contains both optimalinclination=1 and aspect, and logic implies it's the specific call)
                // Actually Main PVcalc in auto mode also has optimalinclination=1. 
                // But MANUAL mode Main PVcalc has `angle=15`.
                // The separate call has `optimalinclination=1`.
                return {
                    ok: true,
                    json: async () => ({
                        inputs: { mounting_system: { fixed: { slope: { value: 30 } } } }
                    })
                };
            }
            if (url.includes('PVcalc') && url.includes('angle=15')) {
                // Main PVcalc call
                return {
                    ok: true,
                    json: async () => ({
                        ...MOCK_PVCALC_RESPONSE,
                        inputs: { mounting_system: { fixed: { slope: { value: 15 } } } }
                    })
                };
            }
            if (url.includes('MRcalc')) {
                return { ok: true, json: async () => ({ outputs: { monthly: [] } }) };
            }
            if (url.includes('seriescalc')) {
                return { ok: true, json: async () => MOCK_SERIESCALC_RESPONSE };
            }
            return { ok: false, statusText: 'Unknown URL' };
        });

        const result = await pvgisService.getPVData(MANUAL_PARAMS);

        expect(result.summary.optimalSlope).toBe(30); // Should be 30, not 15
        expect(result.summary.annualEnergy).toBe(1200); // From main call
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
                return { ok: true, json: async () => ({ outputs: { monthly: [] } }) };
            }
            return { ok: false };
        });

        await expect(pvgisService.getPVData(MOCK_PARAMS))
            .rejects.toThrow('PVGIS API Error');
    });
});
