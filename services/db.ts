
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
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { TariffData, TimeConfig, SavedTimeRange, ComprehensiveResult, PVGISCacheData } from '../types';

// 加入开发模式插件（调试用）
if (import.meta.env.DEV) {
    addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBMigrationSchemaPlugin);

// 定义 Tariff Schema
const tariffSchema = {
    title: 'tariff schema',
    version: 1, // 升级版本
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
        source_config_id: { type: 'string', nullable: true },
        // Supabase 兼容性字段 (RxDB 不允许以 _ 开头的字段名)
        last_modified: { type: 'string', format: 'date-time' },
        _deleted: { type: 'boolean', default: false }
    },
    required: ['id', 'province', 'month', 'category', 'voltage_level', 'prices', 'time_rules', 'last_modified']
};

// 定义 TimeConfig Schema
const timeConfigSchema = {
    title: 'time config schema',
    version: 1, // 升级版本
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
        updated_at: { type: 'string', format: 'date-time' },
        // Supabase 兼容性字段
        last_modified: { type: 'string', format: 'date-time' },
        _deleted: { type: 'boolean', default: false }
    },
    required: ['id', 'province', 'month_pattern', 'time_rules', 'updated_at', 'last_modified']
};

// 定义 SavedTimeRange Schema
const savedTimeRangeSchema = {
    title: 'saved time range schema',
    version: 1, // 升级版本
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        name: { type: 'string' },
        startTime: { type: 'string' },
        endTime: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        // Supabase 兼容性字段
        last_modified: { type: 'string', format: 'date-time' },
        _deleted: { type: 'boolean', default: false }
    },
    required: ['id', 'name', 'startTime', 'endTime', 'created_at', 'last_modified']
};

// 定义 ComprehensiveResult Schema
const comprehensiveResultSchema = {
    title: 'comprehensive result schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        province: { type: 'string' },
        category: { type: 'string' },
        voltage_level: { type: 'string' },
        avg_price: { type: 'number' },
        months: { type: 'array', items: { type: 'string' } },
        start_time: { type: 'string' },
        end_time: { type: 'string' },
        last_modified: { type: 'string' }, // Removed date-time format to avoid validation issues
        _deleted: { type: 'boolean', default: false }
    },
    required: ['id', 'province', 'category', 'voltage_level', 'avg_price', 'months', 'start_time', 'end_time', 'last_modified']
};

// 定义 PVGIS Cache Schema
const pvgisCacheSchema = {
    title: 'pvgis cache schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        params: { type: 'object' },
        summary: { type: 'object' },
        hourly: { type: 'array' },
        created_at: { type: 'number' },
        _deleted: { type: 'boolean', default: false }
    },
    required: ['id', 'params', 'summary', 'created_at']
};


type TariffCollection = RxCollection<TariffData>;
type TimeConfigCollection = RxCollection<TimeConfig>;
type SavedTimeRangeCollection = RxCollection<SavedTimeRange>;
type ComprehensiveResultCollection = RxCollection<ComprehensiveResult>;
type PVGISCacheCollection = RxCollection<PVGISCacheData>;

export type SolarDatabaseCollections = {
    tariffs: TariffCollection;
    time_configs: TimeConfigCollection;
    saved_time_ranges: SavedTimeRangeCollection;
    comprehensive_results: ComprehensiveResultCollection;
    pvgis_cache: PVGISCacheCollection;
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
                schema: tariffSchema,
                migrationStrategies: {
                    // 从 v0 迁移到 v1 的策略
                    1: (oldDoc: any) => {
                        oldDoc.last_modified = oldDoc.last_modified || new Date().toISOString();
                        oldDoc._deleted = oldDoc._deleted || false;
                        return oldDoc;
                    }
                }
            },
            time_configs: {
                schema: timeConfigSchema,
                migrationStrategies: {
                    1: (oldDoc: any) => {
                        oldDoc.last_modified = oldDoc.last_modified || new Date().toISOString();
                        oldDoc._deleted = oldDoc._deleted || false;
                        return oldDoc;
                    }
                }
            },
            saved_time_ranges: {
                schema: savedTimeRangeSchema,
                migrationStrategies: {
                    1: (oldDoc: any) => {
                        oldDoc.last_modified = oldDoc.last_modified || new Date().toISOString();
                        oldDoc._deleted = oldDoc._deleted || false;
                        return oldDoc;
                    }
                }
            },
            comprehensive_results: {
                schema: comprehensiveResultSchema
            },
            pvgis_cache: {
                schema: pvgisCacheSchema
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

