CREATE TABLE IF NOT EXISTS sync_documents (
  collection TEXT NOT NULL,
  doc_id TEXT NOT NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  doc_json TEXT,
  modified_at TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  updated_by_email TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection, doc_id)
);

CREATE TABLE IF NOT EXISTS sync_changes (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  collection TEXT NOT NULL,
  doc_id TEXT NOT NULL,
  op TEXT NOT NULL CHECK(op IN ('upsert', 'delete')),
  modified_at TEXT NOT NULL,
  doc_json TEXT,
  payload_hash TEXT NOT NULL,
  updated_by_email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sync_changes_seq ON sync_changes(seq);
CREATE INDEX IF NOT EXISTS idx_sync_changes_collection_seq ON sync_changes(collection, seq);
