
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
import { SyncOutboxItem } from './sync/types';

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
    version: 4, // 升级版本
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        created_at: { type: 'string' },
        province: { type: 'string' },
        city: { type: 'string', nullable: true },
        month: { type: 'string' },
        category: { type: 'string' },
        voltage_level: { type: 'string' },
        prices: {
            type: 'object',
            properties: {
                tip: { type: 'number', nullable: true },
                peak: { type: 'number', nullable: true },
                flat: { type: 'number', nullable: true },
                valley: { type: 'number', nullable: true },
                deep: { type: 'number', nullable: true },
                energy_usage: { type: 'number', nullable: true },
                purchase_agent: { type: 'number', nullable: true },
                line_loss: { type: 'number', nullable: true },
                system_cost: { type: 'number', nullable: true },
                transmission_distribution: { type: 'number', nullable: true },
                government_funds: { type: 'number', nullable: true },
                demand_charge: { type: 'number', nullable: true },
                capacity_charge: { type: 'number', nullable: true }
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
                },
                required: ['start', 'end', 'type']
            }
        },
        source: { type: 'string', nullable: true },
        currency_unit: { type: 'string', nullable: true },
        policy_code: { type: 'string', nullable: true },
        is_market_based: { type: 'boolean', default: false },
        market_notes: { type: 'string', nullable: true },
        float_rules: {
            type: 'object',
            nullable: true,
            properties: {
                tip: { type: 'number', nullable: true },
                peak: { type: 'number', nullable: true },
                flat: { type: 'number', nullable: true },
                valley: { type: 'number', nullable: true },
                deep: { type: 'number', nullable: true },
                base_type: { type: 'string', nullable: true },
                formula_note: { type: 'string', nullable: true },
                special_period_note: { type: 'string', nullable: true }
            }
        },
        source_config_id: { type: 'string', nullable: true },
        // Supabase 兼容性字段 (RxDB 不允许以 _ 开头的字段名)
        last_modified: { type: 'string' },
        _deleted: { type: 'boolean', default: false }
    },
    required: ['id', 'province', 'month', 'category', 'voltage_level', 'prices', 'time_rules', 'last_modified']
};

// 定义 TimeConfig Schema
const timeConfigSchema = {
    title: 'time config schema',
    version: 5,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        created_at: { type: 'string', nullable: true },
        province: { type: 'string' },
        year: { type: 'number' },
        config_type: { type: 'string' },
        month_pattern: { type: 'string', nullable: true },
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
                },
                required: ['start', 'end', 'type']
            }
        },
        is_market_based: { type: 'boolean', default: false },
        market_notes: { type: 'string', nullable: true },
        policy_code: { type: 'string', nullable: true },
        updated_at: { type: 'string' },
        // Supabase 兼容性字段
        last_modified: { type: 'string' },
        _deleted: { type: 'boolean', default: false }
    },
    required: ['id', 'province', 'year', 'config_type', 'time_rules', 'updated_at', 'last_modified']
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

const syncOutboxSchema = {
    title: 'sync outbox schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 200 },
        collection: { type: 'string' },
        doc_id: { type: 'string' },
        op: { type: 'string' },
        modified_at: { type: 'string', format: 'date-time' },
        doc_json: { type: 'string', nullable: true },
        updated_at: { type: 'string', format: 'date-time' },
        retry_count: { type: 'number', minimum: 0, maximum: 100000, default: 0 }
    },
    required: ['id', 'collection', 'doc_id', 'op', 'modified_at', 'updated_at', 'retry_count']
};


type TariffCollection = RxCollection<TariffData>;
type TimeConfigCollection = RxCollection<TimeConfig>;
type SavedTimeRangeCollection = RxCollection<SavedTimeRange>;
type ComprehensiveResultCollection = RxCollection<ComprehensiveResult>;
type PVGISCacheCollection = RxCollection<PVGISCacheData>;
type OperationLogCollection = RxCollection<OperationLog>;
type HolidaysCollection = RxCollection<HolidayDefinition>;
type PersonaCollection = RxCollection<LoadPersona>;
type SyncOutboxCollection = RxCollection<SyncOutboxItem>;

export type SolarDatabaseCollections = {
    tariffs: TariffCollection;
    time_configs: TimeConfigCollection;
    personas: PersonaCollection;
    saved_time_ranges: SavedTimeRangeCollection;
    comprehensive_results: ComprehensiveResultCollection;
    pvgis_cache: PVGISCacheCollection;
    operation_logs: OperationLogCollection;
    holidays: HolidaysCollection;
    sync_outbox: SyncOutboxCollection;
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
                        const doc = { ...oldDoc };
                        doc.last_modified = doc.last_modified || new Date().toISOString();
                        doc._deleted = doc._deleted || false;
                        return doc;
                    },
                    2: (oldDoc: any) => {
                        const doc = { ...oldDoc };
                        doc.last_modified = doc.last_modified || new Date().toISOString();
                        doc._deleted = doc._deleted || false;
                        doc.prices = doc.prices || {};
                        return doc;
                    },
                    3: (oldDoc: any) => {
                        const doc = { ...oldDoc };
                        doc.last_modified = doc.last_modified || new Date().toISOString();
                        doc._deleted = doc._deleted || false;
                        doc.prices = doc.prices || {};
                        return doc;
                    },
                    4: (oldDoc: any) => {
                        const doc = { ...oldDoc };
                        doc.last_modified = doc.last_modified || new Date().toISOString();
                        doc._deleted = doc._deleted || false;
                        doc.prices = doc.prices || {};
                        return doc;
                    }
                }
            },
            time_configs: {
                schema: timeConfigSchema,
                migrationStrategies: {
                    1: (oldDoc: any) => {
                        const doc = { ...oldDoc };
                        doc.last_modified = doc.last_modified || new Date().toISOString();
                        doc._deleted = doc._deleted || false;
                        return doc;
                    },
                    2: (oldDoc: any) => {
                        const doc = { ...oldDoc };
                        doc.last_modified = doc.last_modified || new Date().toISOString();
                        doc._deleted = doc._deleted || false;

                        if (doc.weekend_time_rules !== undefined && !Array.isArray(doc.weekend_time_rules)) {
                            delete doc.weekend_time_rules;
                        }

                        return doc;
                    },
                    3: (oldDoc: any) => {
                        const doc = { ...oldDoc };
                        doc.last_modified = doc.last_modified || new Date().toISOString();
                        doc.updated_at = doc.updated_at || doc.last_modified;
                        doc._deleted = doc._deleted || false;

                        if (doc.weekend_time_rules !== undefined) {
                            delete doc.weekend_time_rules;
                        }

                        const parsedYear = Number.parseInt(String(doc.year ?? ''), 10);
                        if (!Number.isFinite(parsedYear)) {
                            const fallback = Number.parseInt(String(doc.updated_at || doc.last_modified).slice(0, 4), 10);
                            doc.year = Number.isFinite(fallback) ? fallback : new Date().getFullYear();
                        } else {
                            doc.year = parsedYear;
                        }

                        if (doc.config_type !== 'special_date') {
                            doc.config_type = 'monthly';
                        }

                        doc.month_pattern = typeof doc.month_pattern === 'string' && doc.month_pattern.trim().length > 0
                            ? doc.month_pattern
                            : 'All';

                        if (doc.config_type === 'special_date') {
                            doc.special_date = typeof doc.special_date === 'string' ? doc.special_date : null;
                        } else {
                            doc.special_date = null;
                        }

                        doc.special_date_end = null;

                        return doc;
                    },
                    4: (oldDoc: any) => {
                        const doc = { ...oldDoc };
                        doc.last_modified = doc.last_modified || new Date().toISOString();
                        doc.updated_at = doc.updated_at || doc.last_modified;
                        doc._deleted = doc._deleted || false;

                        if (doc.config_type === 'special_date') {
                            const start = typeof doc.special_date === 'string' ? doc.special_date : null;
                            const end = typeof doc.special_date_end === 'string' ? doc.special_date_end : null;
                            doc.special_date = start;
                            doc.special_date_end = end;
                        } else {
                            doc.special_date = null;
                            doc.special_date_end = null;
                        }

                        return doc;
                    },
                    5: (oldDoc: any) => {
                        const doc = { ...oldDoc };
                        doc.last_modified = doc.last_modified || new Date().toISOString();
                        doc.updated_at = doc.updated_at || doc.last_modified;
                        doc._deleted = doc._deleted || false;
                        if (doc.is_market_based === undefined) {
                            doc.is_market_based = false;
                        }
                        if (doc.market_notes === undefined) {
                            doc.market_notes = null;
                        }
                        if (doc.policy_code === undefined) {
                            doc.policy_code = null;
                        }
                        if (doc.created_at === undefined) {
                            doc.created_at = null;
                        }
                        return doc;
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
                        const doc = { ...oldDoc };
                        doc.last_modified = doc.last_modified || new Date().toISOString();
                        doc._deleted = doc._deleted || false;
                        return doc;
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
            },
            sync_outbox: {
                schema: syncOutboxSchema
            }
        });

        return db;
    } catch (err) {
        console.error('[RxDB] Error during database creation:', err);

        const isDexieClosed = err instanceof Error &&
            (err.message?.includes('is closed') || (err as any)?.code === 'DM4');
        const isSchemaMismatch = (err as any)?.code === 'DB6' ||
            (err instanceof Error && (err.message?.includes('schema') || err.message?.includes('DB6')));

        if ((isDexieClosed || isSchemaMismatch) && !isRetry) {
            console.warn('[RxDB] Migration/Schema error detected. Removing outdated DB and retrying initialization...', err);
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
