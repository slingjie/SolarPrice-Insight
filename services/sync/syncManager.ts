import { applyIncomingChange } from './syncAdapters';
import { syncClient, SyncHttpError } from './syncClient';
import { runWithoutOutboxEnqueue, syncOutboxService } from './syncOutboxService';
import { SyncChange, SyncState } from './types';
import { SYNC_BATCH_LIMIT, SYNC_OUTBOX_DRAIN_LIMIT } from './syncUtils';
import { getDatabase } from '../db';

const CURSOR_STORAGE_KEY = 'spi_sync_cursor_v1';
const CLIENT_ID_STORAGE_KEY = 'spi_sync_client_id_v1';

const POLL_INTERVAL_MS = 30_000;
const SYNC_DEBOUNCE_MS = 3_000;

type SyncStateListener = (state: SyncState) => void;

const getInitialState = (): SyncState => ({
  enabled: true,
  status: 'idle',
  pendingCount: 0,
  lastSuccessAt: null,
  lastError: null,
  authenticatedEmail: null,
});

const getStoredCursor = (): number => {
  const raw = localStorage.getItem(CURSOR_STORAGE_KEY);
  const value = Number.parseInt(raw || '0', 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

const setStoredCursor = (cursor: number): void => {
  localStorage.setItem(CURSOR_STORAGE_KEY, String(Math.max(0, Math.floor(cursor))));
};

const getOrCreateClientId = (): string => {
  const cached = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (cached && cached.length > 0) {
    return cached;
  }

  const next = crypto.randomUUID();
  localStorage.setItem(CLIENT_ID_STORAGE_KEY, next);
  return next;
};

class SyncManager {
  private state: SyncState = getInitialState();

  private listeners = new Set<SyncStateListener>();

  private started = false;

  private inFlight = false;

  private pollTimer: number | null = null;

  private debounceTimer: number | null = null;

  private detachListeners: (() => void) | null = null;

  private async refreshPendingCount(): Promise<number> {
    try {
      return await syncOutboxService.countPending();
    } catch (error) {
      console.error('[Sync] Failed to query outbox count:', error);
      return this.state.pendingCount;
    }
  }

  private emitState(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private setState(next: Partial<SyncState>): void {
    this.state = {
      ...this.state,
      ...next,
    };
    this.emitState();
  }

  getState(): SyncState {
    return this.state;
  }

  subscribe(listener: SyncStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  start(): void {
    if (this.started) {
      return;
    }

    this.started = true;
    this.setState({
      enabled: true,
      status: navigator.onLine ? 'idle' : 'offline',
    });

    const onOnline = () => {
      this.setState({ status: 'pending' });
      void this.syncNow('online');
    };

    const onOffline = () => {
      void this.refreshPendingCount().then((pendingCount) => {
        this.setState({
          status: 'offline',
          pendingCount,
        });
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void this.syncNow('visibility');
      }
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisibilityChange);

    this.pollTimer = window.setInterval(() => {
      void this.syncNow('interval');
    }, POLL_INTERVAL_MS);

    void this.syncNow('startup');

    const stop = () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };

    this.detachListeners = stop;
  }

  stop(): void {
    if (!this.started) {
      return;
    }

    this.started = false;

    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.detachListeners) {
      this.detachListeners();
      this.detachListeners = null;
    }
  }

  requestSyncSoon(): void {
    if (!this.started || this.state.status === 'disabled') {
      return;
    }

    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.debounceTimer = null;
      void this.syncNow('debounce');
    }, SYNC_DEBOUNCE_MS);

    void this.refreshPendingCount().then((pendingCount) => {
      this.setState({
        status: navigator.onLine ? 'pending' : 'offline',
        pendingCount,
      });
    });
  }

  private async pushPendingChanges(clientId: string): Promise<void> {
    while (true) {
      const pendingBatch = await syncOutboxService.drainBatch(SYNC_OUTBOX_DRAIN_LIMIT);
      if (pendingBatch.length === 0) {
        return;
      }

      const response = await syncClient.push({
        client_id: clientId,
        changes: pendingBatch,
      });

      const ackChanges: Array<Pick<SyncChange, 'collection' | 'doc_id'>> = [
        ...response.applied,
        ...response.skipped,
      ];

      await syncOutboxService.ackChanges(ackChanges);

      if (response.server_cursor > 0) {
        setStoredCursor(response.server_cursor);
      }

      if (pendingBatch.length < SYNC_OUTBOX_DRAIN_LIMIT) {
        return;
      }
    }
  }

  private async pullRemoteChanges(): Promise<void> {
    let cursor = getStoredCursor();
    try {
      const db = await getDatabase();
      const count = await db.tariffs.count().exec();
      if (count === 0) {
        cursor = 0;
      }
    } catch (e) {
      console.warn('[Sync] Could not check local tariffs count:', e);
    }

    for (let i = 0; i < 50; i += 1) {
      const response = await syncClient.pull(cursor, SYNC_BATCH_LIMIT);

      await runWithoutOutboxEnqueue(async () => {
        for (const change of response.changes) {
          try {
            await applyIncomingChange(change);
          } catch (err) {
            console.warn('[Sync] Failed to apply change:', change.collection, change.doc_id, err);
          }
        }
      });

      cursor = response.next_cursor;
      setStoredCursor(cursor);

      if (response.changes.length < SYNC_BATCH_LIMIT) {
        return;
      }
    }

    throw new Error('[Sync] Pull loop exceeded safety limit (50 batches)');
  }

  async syncNow(reason: 'startup' | 'online' | 'visibility' | 'interval' | 'debounce' | 'manual' = 'manual'): Promise<void> {
    if (!this.started) {
      return;
    }

    if (this.inFlight) {
      return;
    }

    if (!navigator.onLine) {
      const pendingCount = await this.refreshPendingCount();
      this.setState({
        status: 'offline',
        pendingCount,
      });
      return;
    }

    this.inFlight = true;

    try {
      const pendingCountBefore = await this.refreshPendingCount();
      this.setState({
        status: pendingCountBefore > 0 ? 'syncing' : 'syncing',
        pendingCount: pendingCountBefore,
        lastError: null,
      });

      const me = await syncClient.getAuthMe();
      const clientId = getOrCreateClientId();

      if (me.authenticated) {
        await this.pushPendingChanges(clientId);
      }
      await this.pullRemoteChanges();

      const pendingCountAfter = await this.refreshPendingCount();
      this.setState({
        status: me.authenticated && pendingCountAfter > 0 ? 'pending' : 'synced',
        pendingCount: me.authenticated ? pendingCountAfter : 0,
        lastSuccessAt: new Date().toISOString(),
        authenticatedEmail: me.email,
      });

      if (reason === 'manual' && pendingCountAfter === 0) {
        console.info('[Sync] Manual sync completed');
      }
    } catch (error) {
      const pendingCount = await this.refreshPendingCount();

      if (error instanceof SyncHttpError && error.status === 404) {
        this.setState({
          status: 'disabled',
          enabled: false,
          pendingCount,
          lastError: '同步接口未部署（/api/sync/* 不可用）',
        });
        return;
      }

      if (error instanceof SyncHttpError && (error.status === 401 || error.status === 403)) {
        this.setState({
          status: 'error',
          pendingCount,
          lastError: '认证失败，请先通过 Cloudflare Access 登录。',
        });
        return;
      }

      console.error('[Sync] syncNow failed:', error);
      this.setState({
        status: pendingCount > 0 ? 'pending' : 'error',
        pendingCount,
        lastError: error instanceof Error ? error.message : '同步失败',
      });
    } finally {
      this.inFlight = false;
    }
  }
}

let managerInstance: SyncManager | null = null;

export const getSyncManager = (): SyncManager => {
  if (!managerInstance) {
    managerInstance = new SyncManager();
  }

  return managerInstance;
};
