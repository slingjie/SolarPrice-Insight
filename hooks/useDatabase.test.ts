import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getDatabase } from '../services/db';
import { usePersonas } from './useDatabase';

vi.mock('../services/db', () => ({
  getDatabase: vi.fn(),
}));

const mockedGetDatabase = vi.mocked(getDatabase);

const personaDoc = {
  toJSON: () => ({
    id: 'persona-1',
    slug: 'persona-1',
    name: 'Persona 1',
    weekday_shares: new Array(24).fill(1 / 24),
    isDefault: true,
    updated_at: '2023-01-01T00:00:00.000Z',
    last_modified: '2023-01-01T00:00:00.000Z',
    _deleted: false,
  }),
};

describe('usePersonas', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('exposes personas once the subscription emits', async () => {
    const subscription = { unsubscribe: vi.fn() };
    const subscribe = vi.fn((callback) => {
      callback([personaDoc]);
      return subscription;
    });
    const query = { $: { subscribe } };
    const mockDb = { personas: { find: vi.fn(() => query) } };
    mockedGetDatabase.mockResolvedValue(mockDb as any);

    const { result } = renderHook(() => usePersonas());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.personas).toEqual([personaDoc.toJSON()]);
    expect(subscribe).toHaveBeenCalledOnce();
    expect(subscription.unsubscribe).not.toHaveBeenCalled();
  });

  it('falls back gracefully when initialization fails', async () => {
    mockedGetDatabase.mockRejectedValue(new Error('db-failure'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => usePersonas());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.personas).toEqual([]);
    consoleSpy.mockRestore();
  });
});
