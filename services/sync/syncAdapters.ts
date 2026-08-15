import { getDatabase } from '../db';
import {
  ComprehensiveResult,
  HolidayDefinition,
  LoadPersona,
  SavedTimeRange,
  TariffData,
  TimeConfig,
} from '../../types';
import { SyncChange, SyncCollection } from './types';

const defaultModifiedAt = (): string => new Date().toISOString();

const asObjectRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

export const getDocModifiedAt = (collection: SyncCollection, doc: Record<string, unknown>): string => {
  const maybe = (key: string): string | null => {
    const value = doc[key];
    return typeof value === 'string' && value.length > 0 ? value : null;
  };

  switch (collection) {
    case 'holidays':
      return maybe('updated_at') ?? defaultModifiedAt();
    default:
      return maybe('last_modified') ?? maybe('updated_at') ?? defaultModifiedAt();
  }
};

const normalizeTariffDoc = (doc: Record<string, unknown>, modifiedAt: string): TariffData => {
  const raw = { ...(doc as unknown as TariffData) };
  return {
    ...raw,
    id: String(raw.id || ''),
    city: typeof raw.city === 'string' ? raw.city : undefined,
    policy_code: typeof raw.policy_code === 'string' ? raw.policy_code : undefined,
    market_notes: typeof raw.market_notes === 'string' ? raw.market_notes : undefined,
    is_market_based: Boolean(raw.is_market_based),
    float_rules: raw.float_rules && typeof raw.float_rules === 'object' ? raw.float_rules : undefined,
    prices: raw.prices && typeof raw.prices === 'object' ? raw.prices : ({} as any),
    time_rules: Array.isArray(raw.time_rules) ? raw.time_rules : [],
    currency_unit: raw.currency_unit || '元/kWh',
    last_modified: getDocModifiedAt('tariffs', doc) || modifiedAt,
    _deleted: Boolean(raw._deleted),
  };
};

const normalizeTimeConfigDoc = (doc: Record<string, unknown>, modifiedAt: string): TimeConfig => {
  const raw = { ...(doc as unknown as TimeConfig) };
  return {
    ...raw,
    id: String(raw.id || ''),
    province: raw.province || '全部',
    year: typeof raw.year === 'number' ? raw.year : new Date().getFullYear(),
    config_type: raw.config_type === 'special_date' ? 'special_date' : 'monthly',
    month_pattern: raw.month_pattern || 'All',
    special_date: typeof raw.special_date === 'string' ? raw.special_date : undefined,
    special_date_end: typeof raw.special_date_end === 'string' ? raw.special_date_end : undefined,
    time_rules: Array.isArray(raw.time_rules) ? raw.time_rules : [],
    is_market_based: Boolean(raw.is_market_based),
    market_notes: typeof raw.market_notes === 'string' ? raw.market_notes : undefined,
    policy_code: typeof raw.policy_code === 'string' ? raw.policy_code : undefined,
    last_modified: getDocModifiedAt('time_configs', doc) || modifiedAt,
    updated_at: typeof doc.updated_at === 'string' ? doc.updated_at : modifiedAt,
    _deleted: Boolean(raw._deleted),
  };
};

const normalizePersonaDoc = (doc: Record<string, unknown>, modifiedAt: string): LoadPersona => ({
  ...(doc as unknown as LoadPersona),
  id: String(doc.id || ''),
  updated_at: typeof doc.updated_at === 'string' ? doc.updated_at : modifiedAt,
  last_modified: getDocModifiedAt('personas', doc) || modifiedAt,
  _deleted: Boolean(doc._deleted),
});

const normalizeComprehensiveResultDoc = (doc: Record<string, unknown>, modifiedAt: string): ComprehensiveResult => ({
  ...(doc as unknown as ComprehensiveResult),
  id: String(doc.id || ''),
  last_modified: getDocModifiedAt('comprehensive_results', doc) || modifiedAt,
  _deleted: Boolean(doc._deleted),
});

const normalizeSavedRangeDoc = (doc: Record<string, unknown>, modifiedAt: string): SavedTimeRange => ({
  ...(doc as unknown as SavedTimeRange),
  id: String(doc.id || ''),
  last_modified: getDocModifiedAt('saved_time_ranges', doc) || modifiedAt,
  _deleted: Boolean(doc._deleted),
});

const normalizeHolidayDoc = (doc: Record<string, unknown>, modifiedAt: string): HolidayDefinition => ({
  ...(doc as unknown as HolidayDefinition),
  id: String(doc.id || ''),
  updated_at: typeof doc.updated_at === 'string' ? doc.updated_at : modifiedAt,
});

export const applyIncomingChange = async (change: SyncChange): Promise<void> => {
  const db = await getDatabase();

  if (change.op === 'delete') {
    switch (change.collection) {
      case 'tariffs': {
        const doc = await db.tariffs.findOne(change.doc_id).exec();
        if (doc) await doc.remove();
        return;
      }
      case 'time_configs': {
        const doc = await db.time_configs.findOne(change.doc_id).exec();
        if (doc) await doc.remove();
        return;
      }
      case 'personas': {
        const doc = await db.personas.findOne(change.doc_id).exec();
        if (doc) await doc.remove();
        return;
      }
      case 'comprehensive_results': {
        const doc = await db.comprehensive_results.findOne(change.doc_id).exec();
        if (doc) await doc.remove();
        return;
      }
      case 'saved_time_ranges': {
        const doc = await db.saved_time_ranges.findOne(change.doc_id).exec();
        if (doc) await doc.remove();
        return;
      }
      case 'holidays': {
        const doc = await db.holidays.findOne(change.doc_id).exec();
        if (doc) await doc.remove();
        return;
      }
      default:
        return;
    }
  }

  const doc = asObjectRecord(change.doc);
  if (!doc) {
    throw new Error(`[Sync] Missing doc payload for upsert change ${change.collection}:${change.doc_id}`);
  }

  switch (change.collection) {
    case 'tariffs':
      await db.tariffs.upsert(normalizeTariffDoc(doc, change.modified_at));
      return;
    case 'time_configs':
      await db.time_configs.upsert(normalizeTimeConfigDoc(doc, change.modified_at));
      return;
    case 'personas':
      await db.personas.upsert(normalizePersonaDoc(doc, change.modified_at));
      return;
    case 'comprehensive_results':
      await db.comprehensive_results.upsert(normalizeComprehensiveResultDoc(doc, change.modified_at));
      return;
    case 'saved_time_ranges':
      await db.saved_time_ranges.upsert(normalizeSavedRangeDoc(doc, change.modified_at));
      return;
    case 'holidays':
      await db.holidays.upsert(normalizeHolidayDoc(doc, change.modified_at));
      return;
    default:
      return;
  }
};
