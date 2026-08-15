import { SyncChange, SyncOutboxItem } from './types';

export const SYNC_BATCH_LIMIT = 500;
export const SYNC_OUTBOX_DRAIN_LIMIT = 200;

export const makeOutboxId = (collection: string, docId: string): string => `${collection}:${docId}`;

export const isValidIsoDateTime = (value: string): boolean => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return false;
  }

  return Number.isFinite(Date.parse(value));
};

const parseTimestamp = (value: string): number => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
};

export const compareModifiedAt = (a: string, b: string): number => {
  const aTs = parseTimestamp(a);
  const bTs = parseTimestamp(b);

  if (aTs === bTs) {
    return a.localeCompare(b);
  }

  return aTs - bTs;
};

export const foldOutboxItem = (
  existing: SyncOutboxItem | null,
  incoming: SyncChange,
): SyncOutboxItem => {
  const now = new Date().toISOString();
  const base: SyncOutboxItem = {
    id: makeOutboxId(incoming.collection, incoming.doc_id),
    collection: incoming.collection,
    doc_id: incoming.doc_id,
    op: incoming.op,
    modified_at: incoming.modified_at,
    doc_json: incoming.doc ? JSON.stringify(incoming.doc) : undefined,
    updated_at: now,
    retry_count: 0,
  };

  if (!existing) {
    return base;
  }

  // Keep the latest logical write by modified_at to avoid stale reordering.
  if (compareModifiedAt(incoming.modified_at, existing.modified_at) < 0) {
    return {
      ...existing,
      updated_at: now,
    };
  }

  return {
    ...base,
    retry_count: existing.retry_count,
  };
};

export const parseOutboxDoc = (item: SyncOutboxItem): Record<string, unknown> | undefined => {
  if (!item.doc_json) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(item.doc_json) as Record<string, unknown>;
    return parsed;
  } catch (error) {
    console.error('[Sync] Failed to parse outbox doc_json:', error);
    return undefined;
  }
};
