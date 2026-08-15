import { requireAccessEmail } from '../../_shared/access';
import {
  applyIncomingChange,
  getServerCursor,
  IncomingChange,
  SYNC_COLLECTIONS,
  SyncCollection,
} from '../../_shared/syncRepo';

const MAX_CHANGES_PER_PUSH = 500;

const json = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isCollection = (value: string): value is SyncCollection =>
  (SYNC_COLLECTIONS as readonly string[]).includes(value);

const parseChange = (value: unknown): IncomingChange | null => {
  if (!isObject(value)) return null;

  const collectionRaw = value.collection;
  const docIdRaw = value.doc_id;
  const opRaw = value.op;
  const modifiedAtRaw = value.modified_at;

  if (typeof collectionRaw !== 'string' || !isCollection(collectionRaw)) return null;
  if (typeof docIdRaw !== 'string' || docIdRaw.trim().length === 0 || docIdRaw.length > 200) return null;
  if (opRaw !== 'upsert' && opRaw !== 'delete') return null;
  if (typeof modifiedAtRaw !== 'string' || !Number.isFinite(Date.parse(modifiedAtRaw))) return null;

  const change: IncomingChange = {
    collection: collectionRaw,
    doc_id: docIdRaw,
    op: opRaw,
    modified_at: modifiedAtRaw,
  };

  if (opRaw === 'upsert') {
    if (!isObject(value.doc)) {
      return null;
    }
    change.doc = value.doc;
  }

  return change;
};

const getDb = (env: Record<string, unknown>): D1Database => {
  const db = env.SYNC_DB;
  if (!db) {
    throw new Error('SYNC_DB binding missing');
  }

  return db as D1Database;
};

export const onRequestPost = async (context: { request: Request; env: Record<string, unknown> }): Promise<Response> => {
  try {
    const email = requireAccessEmail(context.request, context.env);
    const db = getDb(context.env);

    let body: unknown;
    try {
      body = await context.request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    if (!isObject(body)) {
      return json({ error: 'Body must be an object' }, 400);
    }

    if (typeof body.client_id !== 'string' || body.client_id.trim().length === 0 || body.client_id.length > 120) {
      return json({ error: 'Invalid client_id' }, 400);
    }

    if (!Array.isArray(body.changes) || body.changes.length === 0 || body.changes.length > MAX_CHANGES_PER_PUSH) {
      return json({ error: `changes must be a non-empty array (max ${MAX_CHANGES_PER_PUSH})` }, 400);
    }

    const applied: Array<{ collection: SyncCollection; doc_id: string }> = [];
    const skipped: Array<{ collection: SyncCollection; doc_id: string; reason: string }> = [];

    for (const rawChange of body.changes) {
      const change = parseChange(rawChange);
      if (!change) {
        return json({ error: 'Invalid change payload detected' }, 400);
      }

      const result = await applyIncomingChange(db, {
        change,
        updatedByEmail: email,
      });

      if (result.applied) {
        applied.push({ collection: change.collection, doc_id: change.doc_id });
      } else {
        skipped.push({ collection: change.collection, doc_id: change.doc_id, reason: result.reason || 'skipped' });
      }
    }

    const serverCursor = await getServerCursor(db);

    return json({
      applied,
      skipped,
      server_cursor: serverCursor,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[sync/push] Unexpected error:', error);
    return json({ error: 'Internal Server Error' }, 500);
  }
};
