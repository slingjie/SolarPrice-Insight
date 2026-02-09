
import {
    createRxDatabase,
    addRxPlugin,
    removeRxDatabase,
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
import {
    TariffData,
    TimeConfig,
    SavedTimeRange,
    ComprehensiveResult,
    PVGISCacheData,
    OperationLog,
    HolidayDefinition,
    LoadPersona,
} from '../types';

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
    version: 4,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        province: { type: 'string' },
        year: { type: 'number' },
        config_type: { type: 'string' },
        month_pattern: { type: 'string' },
        special_date: { type: 'string', nullable: true },
        special_date_end: { type: 'string', nullable: true },
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
    required: ['id', 'province', 'year', 'config_type', 'month_pattern', 'time_rules', 'updated_at', 'last_modified']
};

const personaSchema = {
    title: 'persona schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        slug: { type: 'string' },
        name: { type: 'string' },
        weekday_shares: { type: 'array', items: { type: 'number' } },
        weekend_shares: { type: 'array', items: { type: 'number' } },
        isDefault: { type: 'boolean' },
        updated_at: { type: 'string', format: 'date-time' },
        last_modified: { type: 'string', format: 'date-time' },
        _deleted: { type: 'boolean', default: false },
    },
    required: ['id', 'slug', 'name', 'weekday_shares', 'isDefault', 'updated_at', 'last_modified'],
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

// 定义 OperationLog Schema
// 注意：RxDB 不允许使用 'collection' 作为字段名（是保留字），因此使用 'target_collection'
const operationLogSchema = {
    title: 'operation log schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        timestamp: { type: 'string' },
        target_collection: { type: 'string' },
        action: { type: 'string' },
        count: { type: 'number' },
        details: { type: 'string' }
    },
    required: ['id', 'timestamp', 'target_collection', 'action', 'count']
};

const holidaysSchema = {
    title: 'holidays schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        name: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        isDefault: { type: 'boolean' },
        updated_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'name', 'startDate', 'endDate', 'isDefault', 'updated_at']
};


type TariffCollection = RxCollection<TariffData>;
type TimeConfigCollection = RxCollection<TimeConfig>;
type SavedTimeRangeCollection = RxCollection<SavedTimeRange>;
type ComprehensiveResultCollection = RxCollection<ComprehensiveResult>;
type PVGISCacheCollection = RxCollection<PVGISCacheData>;
type OperationLogCollection = RxCollection<OperationLog>;
type HolidaysCollection = RxCollection<HolidayDefinition>;
type PersonaCollection = RxCollection<LoadPersona>;

export type SolarDatabaseCollections = {
    tariffs: TariffCollection;
    time_configs: TimeConfigCollection;
    personas: PersonaCollection;
    saved_time_ranges: SavedTimeRangeCollection;
    comprehensive_results: ComprehensiveResultCollection;
    pvgis_cache: PVGISCacheCollection;
    operation_logs: OperationLogCollection;
    holidays: HolidaysCollection;
};

export type SolarDatabase = RxDatabase<SolarDatabaseCollections>;

let dbPromise: Promise<SolarDatabase> | null = null;

const createDatabase = async (isRetry = false): Promise<SolarDatabase> => {
    try {
        const db: SolarDatabase = await createRxDatabase<SolarDatabaseCollections>({
            name: 'solardb',
            storage: wrappedValidateAjvStorage({
                storage: getRxStorageDexie()
            }),
            closeDuplicates: true,
        });

        await db.addCollections({
            tariffs: {
                schema: tariffSchema,
                migrationStrategies: {
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
                    },
                    2: (oldDoc: any) => {
                        oldDoc.last_modified = oldDoc.last_modified || new Date().toISOString();
                        oldDoc._deleted = oldDoc._deleted || false;

                        if (oldDoc.weekend_time_rules !== undefined && !Array.isArray(oldDoc.weekend_time_rules)) {
                            delete oldDoc.weekend_time_rules;
                        }

                        return oldDoc;
                    },
                    3: (oldDoc: any) => {
                        oldDoc.last_modified = oldDoc.last_modified || new Date().toISOString();
                        oldDoc.updated_at = oldDoc.updated_at || oldDoc.last_modified;
                        oldDoc._deleted = oldDoc._deleted || false;

                        if (oldDoc.weekend_time_rules !== undefined) {
                            delete oldDoc.weekend_time_rules;
                        }

                        const parsedYear = Number.parseInt(String(oldDoc.year ?? ''), 10);
                        if (!Number.isFinite(parsedYear)) {
                            const fallback = Number.parseInt(String(oldDoc.updated_at || oldDoc.last_modified).slice(0, 4), 10);
                            oldDoc.year = Number.isFinite(fallback) ? fallback : new Date().getFullYear();
                        } else {
                            oldDoc.year = parsedYear;
                        }

                        if (oldDoc.config_type !== 'special_date') {
                            oldDoc.config_type = 'monthly';
                        }

                        oldDoc.month_pattern = typeof oldDoc.month_pattern === 'string' && oldDoc.month_pattern.trim().length > 0
                            ? oldDoc.month_pattern
                            : 'All';

                        if (oldDoc.config_type === 'special_date') {
                            oldDoc.special_date = typeof oldDoc.special_date === 'string' ? oldDoc.special_date : null;
                        } else {
                            oldDoc.special_date = null;
                        }

                        oldDoc.special_date_end = null;

                        return oldDoc;
                    },
                    4: (oldDoc: any) => {
                        oldDoc.last_modified = oldDoc.last_modified || new Date().toISOString();
                        oldDoc.updated_at = oldDoc.updated_at || oldDoc.last_modified;
                        oldDoc._deleted = oldDoc._deleted || false;

                        if (oldDoc.config_type === 'special_date') {
                            const start = typeof oldDoc.special_date === 'string' ? oldDoc.special_date : null;
                            const end = typeof oldDoc.special_date_end === 'string' ? oldDoc.special_date_end : null;
                            oldDoc.special_date = start;
                            oldDoc.special_date_end = end;
                        } else {
                            oldDoc.special_date = null;
                            oldDoc.special_date_end = null;
                        }

                        return oldDoc;
                    }
                }
            },
            personas: {
                schema: personaSchema,
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
            },
            operation_logs: {
                schema: operationLogSchema
            },
            holidays: {
                schema: holidaysSchema
            }
        });

        return db;
    } catch (err) {
        console.error('[RxDB] Error during database creation:', err);

        const isDexieClosed = err instanceof Error &&
            (err.message?.includes('is closed') || (err as any)?.code === 'DM4');
        if (isDexieClosed && !isRetry) {
            console.warn('[RxDB] Migration failed (Dexie storage closed). Removing corrupted DB and retrying...');
            try {
                await removeRxDatabase('solardb', getRxStorageDexie());
            } catch (removeErr) {
                console.error('[RxDB] Failed to remove corrupted DB:', removeErr);
            }
            return createDatabase(true);
        }

        throw err;
    }
};

export const getDatabase = () => {
    if (!dbPromise) {
        dbPromise = createDatabase().catch(err => {
            dbPromise = null;
            throw err;
        });
    }
    return dbPromise;
};
