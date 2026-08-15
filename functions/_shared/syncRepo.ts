export const SYNC_COLLECTIONS = [
  'tariffs',
  'time_configs',
  'personas',
  'comprehensive_results',
  'saved_time_ranges',
  'holidays',
] as const;

export type SyncCollection = (typeof SYNC_COLLECTIONS)[number];
export type SyncOp = 'upsert' | 'delete';

export interface IncomingChange {
  collection: SyncCollection;
  doc_id: string;
  op: SyncOp;
  modified_at: string;
  doc?: Record<string, unknown>;
}

interface CurrentDocumentRow {
  collection: SyncCollection;
  doc_id: string;
  modified_at: string;
  payload_hash: string;
}

const parseTs = (value: string): number => {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : Number.NEGATIVE_INFINITY;
};

const compareModifiedAt = (left: string, right: string): number => {
  const leftTs = parseTs(left);
  const rightTs = parseTs(right);

  if (leftTs === rightTs) {
    return left.localeCompare(right);
  }

  return leftTs - rightTs;
};

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`).join(',')}}`;
};

const hex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

export const hashChangePayload = async (change: IncomingChange): Promise<string> => {
  const body = stableStringify({
    collection: change.collection,
    doc_id: change.doc_id,
    op: change.op,
    modified_at: change.modified_at,
    doc: change.op === 'upsert' ? change.doc || null : null,
  });

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  return hex(new Uint8Array(digest));
};

const readCurrentDocument = async (db: D1Database, collection: SyncCollection, docId: string): Promise<CurrentDocumentRow | null> => {
  return (await db
    .prepare(
      `SELECT collection, doc_id, modified_at, payload_hash
       FROM sync_documents
       WHERE collection = ?1 AND doc_id = ?2`,
    )
    .bind(collection, docId)
    .first()) as CurrentDocumentRow | null;
};

const upsertCurrentDocument = async (
  db: D1Database,
  params: {
    change: IncomingChange;
    payloadHash: string;
    updatedByEmail: string;
  },
): Promise<void> => {
  const docJson = params.change.op === 'upsert' ? JSON.stringify(params.change.doc || {}) : null;

  await db
    .prepare(
      `INSERT INTO sync_documents (
          collection,
          doc_id,
          is_deleted,
          doc_json,
          modified_at,
          payload_hash,
          updated_by_email,
          updated_at
       )
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP)
       ON CONFLICT(collection, doc_id) DO UPDATE SET
         is_deleted = excluded.is_deleted,
         doc_json = excluded.doc_json,
         modified_at = excluded.modified_at,
         payload_hash = excluded.payload_hash,
         updated_by_email = excluded.updated_by_email,
         updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(
      params.change.collection,
      params.change.doc_id,
      params.change.op === 'delete' ? 1 : 0,
      docJson,
      params.change.modified_at,
      params.payloadHash,
      params.updatedByEmail,
    )
    .run();
};

const insertChangeLog = async (
  db: D1Database,
  params: {
    change: IncomingChange;
    payloadHash: string;
    updatedByEmail: string;
  },
): Promise<void> => {
  const docJson = params.change.op === 'upsert' ? JSON.stringify(params.change.doc || {}) : null;

  await db
    .prepare(
      `INSERT INTO sync_changes (
         collection,
         doc_id,
         op,
         modified_at,
         doc_json,
         payload_hash,
         updated_by_email,
         created_at
       )
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP)`,
    )
    .bind(
      params.change.collection,
      params.change.doc_id,
      params.change.op,
      params.change.modified_at,
      docJson,
      params.payloadHash,
      params.updatedByEmail,
    )
    .run();
};

export const applyIncomingChange = async (
  db: D1Database,
  params: {
    change: IncomingChange;
    updatedByEmail: string;
  },
): Promise<{ applied: boolean; reason?: string }> => {
  const payloadHash = await hashChangePayload(params.change);
  const current = await readCurrentDocument(db, params.change.collection, params.change.doc_id);

  if (current) {
    const cmp = compareModifiedAt(params.change.modified_at, current.modified_at);

    if (cmp < 0) {
      return { applied: false, reason: 'stale' };
    }

    if (cmp === 0) {
      if (payloadHash === current.payload_hash) {
        return { applied: false, reason: 'idempotent' };
      }

      if (payloadHash.localeCompare(current.payload_hash) <= 0) {
        return { applied: false, reason: 'stale_tie' };
      }
    }
  }

  await upsertCurrentDocument(db, {
    change: params.change,
    payloadHash,
    updatedByEmail: params.updatedByEmail,
  });

  await insertChangeLog(db, {
    change: params.change,
    payloadHash,
    updatedByEmail: params.updatedByEmail,
  });

  return { applied: true };
};

export const getServerCursor = async (db: D1Database): Promise<number> => {
  const row = (await db
    .prepare('SELECT COALESCE(MAX(seq), 0) AS cursor FROM sync_changes')
    .first()) as { cursor?: number | string } | null;

  const value = Number(row?.cursor || 0);
  return Number.isFinite(value) ? value : 0;
};

export const pullChangesAfterCursor = async (
  db: D1Database,
  cursor: number,
  limit: number,
): Promise<{
  changes: Array<IncomingChange & { seq: number }>;
  nextCursor: number;
}> => {
  const rows = (await db
    .prepare(
      `SELECT seq, collection, doc_id, op, modified_at, doc_json
       FROM sync_changes
       WHERE seq > ?1
       ORDER BY seq ASC
       LIMIT ?2`,
    )
    .bind(cursor, limit)
    .all()) as D1Result<{
    seq: number;
    collection: SyncCollection;
    doc_id: string;
    op: SyncOp;
    modified_at: string;
    doc_json: string | null;
  }>;

  const results = (rows.results || []).map((row) => ({
    seq: row.seq,
    collection: row.collection,
    doc_id: row.doc_id,
    op: row.op,
    modified_at: row.modified_at,
    doc: row.doc_json ? (JSON.parse(row.doc_json) as Record<string, unknown>) : undefined,
  }));

  const nextCursor = results.length > 0 ? results[results.length - 1].seq : cursor;

  return {
    changes: results,
    nextCursor,
  };
};
