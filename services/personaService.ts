import { getDatabase } from './db';
import type { LoadPersona } from '../types';

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
  await db.personas.upsert({
    ...persona,
    last_modified: persona.last_modified || new Date().toISOString(),
    _deleted: persona._deleted || false,
  });
}

export async function deletePersona(id: string): Promise<void> {
  const db = await getDatabase();
  const doc = await db.personas.findOne(id).exec();
  if (doc) {
    await doc.remove();
  }
}
