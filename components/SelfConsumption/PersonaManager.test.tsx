import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PersonaManager } from './PersonaManager';
import { savePersona } from '../../services/personaService';

vi.mock('../../services/personaService', () => ({
  savePersona: vi.fn(),
  deletePersona: vi.fn(),
}));

const mockedSavePersona = vi.mocked(savePersona);

const basePersona = {
  id: 'p-1',
  slug: 'p-1',
  name: 'Base Persona',
  weekday_shares: new Array(24).fill(1 / 24),
  isDefault: false,
  updated_at: '2025-01-01T00:00:00.000Z',
  last_modified: '2025-01-01T00:00:00.000Z',
  _deleted: false,
};

const renderManager = (props?: Partial<Parameters<typeof PersonaManager>[0]>) =>
  render(
    <PersonaManager
      isOpen
      onClose={vi.fn()}
      personas={[basePersona]}
      loading={false}
      selectedPersonaId={basePersona.id}
      onSelectPersonaId={vi.fn()}
      {...props}
    />
  );

describe('PersonaManager create flow', () => {
  beforeEach(() => {
    mockedSavePersona.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the selection callback when creation succeeds', async () => {
    mockedSavePersona.mockResolvedValueOnce(undefined);
    const onSelectPersonaId = vi.fn();
    const uuidValue = '11111111-1111-1111-1111-111111111111';
    const uuidSpy = vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(uuidValue);

    render(
      <PersonaManager
        isOpen
        onClose={vi.fn()}
        personas={[basePersona]}
        loading={false}
        selectedPersonaId={basePersona.id}
        onSelectPersonaId={onSelectPersonaId}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /新建/ }));

    await waitFor(() => expect(onSelectPersonaId).toHaveBeenCalledWith(uuidValue));
    expect(mockedSavePersona).toHaveBeenCalled();
    uuidSpy.mockRestore();
  });

  it('renders an error message when creation fails', async () => {
    mockedSavePersona.mockRejectedValueOnce(new Error('boom'));
    const uuidValue = '22222222-2222-2222-2222-222222222222';
    const uuidSpy = vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(uuidValue);

    renderManager();

    fireEvent.click(screen.getByRole('button', { name: /新建/ }));

    await waitFor(() => expect(screen.getByText('创建画像失败，请重试。')).toBeInTheDocument());
    uuidSpy.mockRestore();
  });
});
