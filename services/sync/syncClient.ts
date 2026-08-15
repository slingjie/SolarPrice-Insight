import {
  SyncAuthMeResponse,
  SyncPullResponse,
  SyncPushRequest,
  SyncPushResponse,
} from './types';

export class SyncHttpError extends Error {
  status: number;

  body: string;

  constructor(status: number, body: string) {
    super(`Sync HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

const fetchJson = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    credentials: 'include',
    ...init,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new SyncHttpError(response.status, body);
  }

  return (await response.json()) as T;
};

export const syncClient = {
  getAuthMe(): Promise<SyncAuthMeResponse> {
    return fetchJson<SyncAuthMeResponse>('/api/auth/me', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  },

  push(body: SyncPushRequest): Promise<SyncPushResponse> {
    return fetchJson<SyncPushResponse>('/api/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  pull(cursor: number, limit: number): Promise<SyncPullResponse> {
    const search = new URLSearchParams({
      cursor: String(cursor),
      limit: String(limit),
    });

    return fetchJson<SyncPullResponse>(`/api/sync/pull?${search.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  },
};
