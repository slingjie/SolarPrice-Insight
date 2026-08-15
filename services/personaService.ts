import { getDatabase } from './db';
import type { LoadPersona } from '../types';
import { syncOutboxService } from './sync/syncOutboxService';
import { getSyncManager } from './sync/syncManager';
import { getDocModifiedAt } from './sync/syncAdapters';

export async function getAllPersonas(): Promise<LoadPersona[]> {
  const db = await getDatabase();
  const docs = await db.personas.find({
    selector: {
      _deleted: { $ne: true },
    },
  }).exec();
  return docs.map((d) => d.toJSON() as LoadPersona);
}

export async function savePersona(persona: LoadPersona): Promise<void> {
  const db = await getDatabase();
  const payload = {
    ...persona,
    last_modified: persona.last_modified || new Date().toISOString(),
    _deleted: persona._deleted || false,
  };
  await db.personas.upsert(payload);
  await syncOutboxService.enqueueUpsert({
    collection: 'personas',
    docId: payload.id,
    modifiedAt: getDocModifiedAt('personas', payload as unknown as Record<string, unknown>),
    doc: payload as unknown as Record<string, unknown>,
  });
  getSyncManager().requestSyncSoon();
}

export async function deletePersona(id: string): Promise<void> {
  const db = await getDatabase();
  const doc = await db.personas.findOne(id).exec();
  if (doc) {
    await doc.remove();
    await syncOutboxService.enqueueDelete({
      collection: 'personas',
      docId: id,
      modifiedAt: new Date().toISOString(),
    });
    getSyncManager().requestSyncSoon();
  }
}
