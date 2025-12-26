
import {
    createRxDatabase,
    addRxPlugin,
    RxDatabase,
    RxCollection,
    RxDocument
} from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { TariffData, TimeConfig } from '../types';

// 加入开发模式插件（调试用）
if (import.meta.env.DEV) {
    addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);

// 定义 Tariff Schema
const tariffSchema = {
    title: 'tariff schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        created_at: { type: 'string', format: 'date-time' },
        province: { type: 'string' },
        city: { type: 'string', nullable: true },
        month: { type: 'string' },
        category: { type: 'string' },
        voltage_level: { type: 'string' },
        prices: {
            type: 'object',
            properties: {
                tip: { type: 'number' },
                peak: { type: 'number' },
                flat: { type: 'number' },
                valley: { type: 'number' },
                deep: { type: 'number' }
            }
        },
        time_rules: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    start: { type: 'string' },
                    end: { type: 'string' },
                    type: { type: 'string' }
                }
            }
        },
        currency_unit: { type: 'string' },
        source_config_id: { type: 'string', nullable: true }
    },
    required: ['id', 'province', 'month', 'category', 'voltage_level', 'prices', 'time_rules']
};

// 定义 TimeConfig Schema
const timeConfigSchema = {
    title: 'time config schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        province: { type: 'string' },
        month_pattern: { type: 'string' },
        time_rules: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    start: { type: 'string' },
                    end: { type: 'string' },
                    type: { type: 'string' }
                }
            }
        },
        updated_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'province', 'month_pattern', 'time_rules', 'updated_at']
};

// 定义 SavedTimeRange Schema
const savedTimeRangeSchema = {
    title: 'saved time range schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        name: { type: 'string' },
        startTime: { type: 'string' },
        endTime: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'name', 'startTime', 'endTime', 'created_at']
};

type TariffCollection = RxCollection<TariffData>;
type TimeConfigCollection = RxCollection<TimeConfig>;
type SavedTimeRangeCollection = RxCollection<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    created_at: string;
}>;

export type SolarDatabaseCollections = {
    tariffs: TariffCollection;
    time_configs: TimeConfigCollection;
    saved_time_ranges: SavedTimeRangeCollection;
};

export type SolarDatabase = RxDatabase<SolarDatabaseCollections>;

let dbPromise: Promise<SolarDatabase> | null = null;

const createDatabase = async () => {
    try {
        const db: SolarDatabase = await createRxDatabase<SolarDatabaseCollections>({
            name: 'solardb',
            storage: wrappedValidateAjvStorage({
                storage: getRxStorageDexie()
            })
        });

        await db.addCollections({
            tariffs: {
                schema: tariffSchema
            },
            time_configs: {
                schema: timeConfigSchema
            },
            saved_time_ranges: {
                schema: savedTimeRangeSchema
            }
        });

        return db;
    } catch (err) {
        console.error('[RxDB] Error during database creation:', err);
        throw err;
    }
};

export const getDatabase = () => {
    if (!dbPromise) {
        dbPromise = createDatabase();
    }
    return dbPromise;
};
