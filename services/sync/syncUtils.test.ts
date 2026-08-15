import { describe, expect, it } from 'vitest';
import { compareModifiedAt, foldOutboxItem, makeOutboxId } from './syncUtils';
import { SyncOutboxItem } from './types';

describe('syncUtils.compareModifiedAt', () => {
  it('returns positive for newer timestamp', () => {
    const result = compareModifiedAt('2026-02-27T12:00:00.000Z', '2026-02-27T11:59:59.000Z');
    expect(result).toBeGreaterThan(0);
  });

  it('returns negative for older timestamp', () => {
    const result = compareModifiedAt('2026-02-27T11:59:59.000Z', '2026-02-27T12:00:00.000Z');
    expect(result).toBeLessThan(0);
  });

  it('uses lexical tie-break when parsed time is equal', () => {
    const result = compareModifiedAt('2026-02-27T12:00:00.000Z', '2026-02-27T12:00:00.000Z');
    expect(result).toBe(0);
  });
});

describe('syncUtils.foldOutboxItem', () => {
  const existing: SyncOutboxItem = {
    id: makeOutboxId('tariffs', 'doc-1'),
    collection: 'tariffs',
    doc_id: 'doc-1',
    op: 'upsert',
    modified_at: '2026-02-27T12:00:00.000Z',
    doc_json: JSON.stringify({ id: 'doc-1', value: 1 }),
    updated_at: '2026-02-27T12:00:00.000Z',
    retry_count: 2,
  };

  it('keeps newer incoming change', () => {
    const next = foldOutboxItem(existing, {
      collection: 'tariffs',
      doc_id: 'doc-1',
      op: 'delete',
      modified_at: '2026-02-27T12:00:01.000Z',
    });

    expect(next.op).toBe('delete');
    expect(next.retry_count).toBe(2);
  });

  it('keeps existing when incoming is stale', () => {
    const next = foldOutboxItem(existing, {
      collection: 'tariffs',
      doc_id: 'doc-1',
      op: 'delete',
      modified_at: '2026-02-27T11:59:00.000Z',
    });

    expect(next.op).toBe('upsert');
    expect(next.modified_at).toBe(existing.modified_at);
  });

  it('creates row when there is no existing change', () => {
    const next = foldOutboxItem(null, {
      collection: 'tariffs',
      doc_id: 'doc-2',
      op: 'upsert',
      modified_at: '2026-02-27T12:01:00.000Z',
      doc: { id: 'doc-2', value: 2 },
    });

    expect(next.id).toBe(makeOutboxId('tariffs', 'doc-2'));
    expect(next.op).toBe('upsert');
    expect(next.doc_json).toContain('doc-2');
  });
});
