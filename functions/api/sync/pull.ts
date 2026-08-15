import { pullChangesAfterCursor } from '../../_shared/syncRepo';

const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 500;

const json = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

const parsePositiveInt = (raw: string | null, fallback: number): number => {
  const value = Number.parseInt(raw || '', 10);
  if (!Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return value;
};

const getDb = (env: Record<string, unknown>): D1Database => {
  const db = env.SYNC_DB;
  if (!db) {
    throw new Error('SYNC_DB binding missing');
  }

  return db as D1Database;
};

export const onRequestGet = async (context: { request: Request; env: Record<string, unknown> }): Promise<Response> => {
  try {
    const db = getDb(context.env);

    const url = new URL(context.request.url);
    const cursor = parsePositiveInt(url.searchParams.get('cursor'), 0);
    const requestedLimit = parsePositiveInt(url.searchParams.get('limit'), DEFAULT_LIMIT);
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);

    const { changes, nextCursor } = await pullChangesAfterCursor(db, cursor, limit);

    return json({
      changes,
      next_cursor: nextCursor,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[sync/pull] Unexpected error:', error);
    return json({ error: 'Internal Server Error' }, 500);
  }
};
