import { getDatabase } from '../db';
import { SyncChange, SyncOutboxItem } from './types';
import { foldOutboxItem, makeOutboxId, parseOutboxDoc } from './syncUtils';

let suppressDepth = 0;

export const runWithoutOutboxEnqueue = async <T>(operation: () => Promise<T>): Promise<T> => {
  suppressDepth += 1;
  try {
    return await operation();
  } finally {
    suppressDepth -= 1;
  }
};

const shouldEnqueue = (): boolean => suppressDepth === 0;

const getOutboxCollection = async () => {
  const db = await getDatabase();
  return (db as any).sync_outbox || null;
};

const toOutboxDoc = (change: SyncChange): SyncOutboxItem => ({
  id: makeOutboxId(change.collection, change.doc_id),
  collection: change.collection,
  doc_id: change.doc_id,
  op: change.op,
  modified_at: change.modified_at,
  doc_json: change.doc ? JSON.stringify(change.doc) : undefined,
  updated_at: new Date().toISOString(),
  retry_count: 0,
});

export const syncOutboxService = {
  async enqueue(change: SyncChange): Promise<void> {
    if (!shouldEnqueue()) {
      return;
    }

    const outbox = await getOutboxCollection();
    if (!outbox) {
      return;
    }
    const id = makeOutboxId(change.collection, change.doc_id);
    const existingDoc = await outbox.findOne(id).exec();
    const existing = existingDoc ? (existingDoc.toJSON() as SyncOutboxItem) : null;
    const next = foldOutboxItem(existing, change);
    await outbox.upsert(next);
  },

  async enqueueUpsert(params: {
    collection: SyncChange['collection'];
    docId: string;
    modifiedAt: string;
    doc: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.enqueue({
        collection: params.collection,
        doc_id: params.docId,
        op: 'upsert',
        modified_at: params.modifiedAt,
        doc: params.doc,
      });
    } catch (error) {
      console.error('[Sync] enqueueUpsert failed:', error);
    }
  },

  async enqueueDelete(params: {
    collection: SyncChange['collection'];
    docId: string;
    modifiedAt: string;
  }): Promise<void> {
    try {
      await this.enqueue({
        collection: params.collection,
        doc_id: params.docId,
        op: 'delete',
        modified_at: params.modifiedAt,
      });
    } catch (error) {
      console.error('[Sync] enqueueDelete failed:', error);
    }
  },

  async drainBatch(limit: number): Promise<SyncChange[]> {
    const outbox = await getOutboxCollection();
    if (!outbox) {
      return [];
    }
    const docs = await outbox.find({
      sort: [{ updated_at: 'asc' }],
      limit,
    }).exec();

    return docs.map((doc) => {
      const item = doc.toJSON() as SyncOutboxItem;
      return {
        collection: item.collection,
        doc_id: item.doc_id,
        op: item.op,
        modified_at: item.modified_at,
        doc: parseOutboxDoc(item),
      };
    });
  },

  async ackChanges(changes: Array<Pick<SyncChange, 'collection' | 'doc_id'>>): Promise<void> {
    if (changes.length === 0) {
      return;
    }

    const outbox = await getOutboxCollection();
    if (!outbox) {
      return;
    }
    const ids = Array.from(new Set(changes.map((c) => makeOutboxId(c.collection, c.doc_id))));
    await outbox.bulkRemove(ids);
  },

  async requeueFailed(changes: Array<Pick<SyncChange, 'collection' | 'doc_id'>>): Promise<void> {
    if (changes.length === 0) {
      return;
    }

    const outbox = await getOutboxCollection();
    if (!outbox) {
      return;
    }
    const ids = Array.from(new Set(changes.map((c) => makeOutboxId(c.collection, c.doc_id))));
    const docs = await Promise.all(ids.map((id) => outbox.findOne(id).exec()));

    await Promise.all(
      docs
        .filter((doc): doc is NonNullable<typeof doc> => Boolean(doc))
        .map(async (doc) => {
          const row = doc.toJSON() as SyncOutboxItem;
          await doc.patch({
            retry_count: (row.retry_count || 0) + 1,
            updated_at: new Date().toISOString(),
          });
        }),
    );
  },

  async countPending(): Promise<number> {
    const outbox = await getOutboxCollection();
    if (!outbox) {
      return 0;
    }
    return outbox.count().exec();
  },

  toOutboxDoc,
};
