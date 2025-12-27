import { describe, it, expect, beforeEach, vi } from 'vitest';
import { priceService } from '../services/priceService';
import { configService } from '../services/configService';

// 模拟数据库
vi.mock('../services/db', () => ({
    getDatabase: vi.fn().mockReturnValue(Promise.resolve({
        tariffs: {
            find: () => ({ exec: () => Promise.resolve([]) }),
            upsert: vi.fn().mockResolvedValue({}),
            bulkUpsert: vi.fn().mockResolvedValue({}),
            findOne: () => ({ exec: () => Promise.resolve({ patch: vi.fn(), remove: vi.fn() }) })
        },
        time_configs: {
            find: () => ({ exec: () => Promise.resolve([]) }),
            upsert: vi.fn().mockResolvedValue({})
        },
        saved_time_ranges: {
            find: () => ({ exec: () => Promise.resolve([]) }),
            upsert: vi.fn().mockResolvedValue({}),
            findOne: () => ({ exec: () => Promise.resolve({ patch: vi.fn() }) })
        }
    }))
}));

describe('priceService', () => {
    it('should inject supabase fields on save', async () => {
        const data = {
            province: '广东',
            month: '2025-01',
            category: '工商业',
            voltage_level: '10kV',
            prices: { tip: 1, peak: 0.8, flat: 0.5, valley: 0.3 },
            time_rules: [],
            currency_unit: '元/kWh',
            created_at: new Date().toISOString(),
            city: null
        };

        const result = await priceService.save(data as any);
        expect(result.id).toBeDefined();
        expect(result.last_modified).toBeDefined();
        expect(result._deleted).toBe(false);
    });
});

describe('configService', () => {
    it('should inject supabase fields on saveTimeConfig', async () => {
        const data = {
            province: '浙江',
            month_pattern: 'All',
            time_rules: [],
            updated_at: new Date().toISOString()
        };

        const result = await configService.saveTimeConfig(data as any);
        expect(result.id).toBeDefined();
        expect(result.last_modified).toBeDefined();
        expect(result._deleted).toBe(false);
    });
});
