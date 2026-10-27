import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppSelector } from '../../../hooks/store.js';
import { useLocationSubmit } from '../../location/hooks.js';
import { useWebsiteSubmit } from '../../website/hooks.js';
import { useCreatePlaceMutation } from '../api.js';

vi.mock('../../../hooks/store.js', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: vi.fn(),
}));
vi.mock('../../../contexts', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock('../api.js', () => ({
  useCreatePlaceMutation: vi.fn(),
}));

const createPlace = vi.fn();

describe.each([
  { type: 'offline', useSubmit: useLocationSubmit },
  { type: 'online', useSubmit: useWebsiteSubmit },
])('$type access point submission', ({ type, useSubmit }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreatePlaceMutation).mockReturnValue([
      createPlace,
      { isLoading: false, reset: vi.fn() },
    ]);
  });

  const submit = async (
    contacts: { type: 'email' | 'phone' | 'website'; value: string }[],
  ) => {
    vi.mocked(useAppSelector).mockReturnValue({
      name: 'Punto di accesso',
      address: 'Via Roma, 1',
      city: 'Roma',
      postalCode: '00100',
      province: 'RM',
      url: 'https://example.it',
      urlError: null,
      contacts,
    });
    const setAttempted = vi.fn();
    let handleConfirm: (() => Promise<void>) | undefined;
    const Harness = () => {
      ({ handleConfirm } = useSubmit(vi.fn(), vi.fn(), setAttempted));
      return null;
    };
    renderToStaticMarkup(createElement(Harness));
    expect(handleConfirm).toBeDefined();
    await handleConfirm?.();
    expect(setAttempted).toHaveBeenCalledWith(true);
  };

  it.each(['email', 'phone', 'website'] as const)(
    'does not send an API request for an invalid %s',
    async (contactType) => {
      await submit([
        { type: 'email', value: 'valido@example.it' },
        { type: contactType, value: 'not-a-contact' },
      ]);
      expect(createPlace).not.toHaveBeenCalled();
    },
  );

  it('saves valid contacts and ignores optional empty contacts', async () => {
    const contacts = [
      { type: 'email', value: 'assistenza@example.it' },
      { type: 'phone', value: '+39 02 12345678' },
      { type: 'website', value: 'https://example.it' },
    ] as const;
    createPlace.mockResolvedValue({ data: { id: 'new-place' } });
    await submit([...contacts, { type: 'email', value: '   ' }]);
    expect(createPlace).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ type, supportContacts: contacts }),
    );
  });
});
