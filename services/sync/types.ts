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

export interface SyncChange {
  collection: SyncCollection;
  doc_id: string;
  op: SyncOp;
  modified_at: string;
  doc?: Record<string, unknown>;
}

export interface SyncPushRequest {
  client_id: string;
  changes: SyncChange[];
}

export interface SyncPushAckItem {
  collection: SyncCollection;
  doc_id: string;
}

export interface SyncPushSkipItem extends SyncPushAckItem {
  reason: string;
}

export interface SyncPushResponse {
  applied: SyncPushAckItem[];
  skipped: SyncPushSkipItem[];
  server_cursor: number;
}

export interface SyncPullResponse {
  changes: Array<SyncChange & { seq: number }>;
  next_cursor: number;
}

export interface SyncAuthMeResponse {
  email: string;
  authenticated: true;
}

export interface SyncOutboxItem {
  id: string;
  collection: SyncCollection;
  doc_id: string;
  op: SyncOp;
  modified_at: string;
  doc_json?: string;
  updated_at: string;
  retry_count: number;
}

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'pending'
  | 'offline'
  | 'disabled'
  | 'error';

export interface SyncState {
  enabled: boolean;
  status: SyncStatus;
  pendingCount: number;
  lastSuccessAt: string | null;
  lastError: string | null;
  authenticatedEmail: string | null;
}
