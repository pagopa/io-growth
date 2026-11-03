import { describe, expect, it, vi } from 'vitest';
import type { PlaceCreateRequest } from '../../../../generated/model';
import type { LocationState } from '../../types.js';
import { submitLocations } from '../submitLocations.js';

const createLocation = (id: string, name: string): LocationState => ({
  id,
  name,
  street: 'Via Roma, 1',
  city: 'Roma',
  state: 'RM',
  postalCode: '00100',
  websiteUrl: '',
  websiteUrlError: null,
  contacts: [{ type: 'phone', value: '+39 02 12345678' }],
});

describe('submitLocations', () => {
  it('keeps only the failed locations on partial failure', async () => {
    const createPlace = vi.fn((payload: PlaceCreateRequest) =>
      payload.name === 'Sede B'
        ? Promise.reject(new Error('Bad request'))
        : Promise.resolve({ id: 'new-place' }),
    );
    const keepFailedLocations = vi.fn();
    const navigate = vi.fn();
    const showToast = vi.fn();

    await submitLocations({
      locations: [
        createLocation('location-1', 'Sede A'),
        createLocation('location-2', 'Sede B'),
        createLocation('location-3', 'Sede C'),
      ],
      type: 'offline',
      createPlace,
      keepFailedLocations,
      navigate,
      showToast,
    });

    expect(createPlace).toHaveBeenCalledTimes(3);
    expect(keepFailedLocations).toHaveBeenCalledExactlyOnceWith(
      new Set(['location-2']),
    );
    expect(showToast).toHaveBeenCalledExactlyOnceWith(
      'Creati 2 punti di accesso; 1 non creati. Puoi riprovare.',
      'error',
    );
    expect(navigate).not.toHaveBeenCalled();
  });
});
