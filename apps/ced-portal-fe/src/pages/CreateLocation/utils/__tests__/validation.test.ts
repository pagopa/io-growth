import { describe, expect, it } from 'vitest';
import type { LocationState, LocationType } from '../../types.js';
import {
  getRequiredFieldError,
  getWebsiteUrlError,
  isLocValid,
} from '../validation.js';

const location: LocationState = {
  id: 'location-1',
  name: 'Punto di accesso',
  street: 'Via Roma, 1',
  city: 'Roma',
  state: 'RM',
  postalCode: '00100',
  websiteUrl: 'https://example.it',
  contacts: [{ type: 'phone', value: '+39 02 12345678' }],
};

describe('CreateLocation validation', () => {
  it.each<LocationType>(['offline', 'online'])(
    'accepts a complete %s location',
    (type) => {
      expect(isLocValid(location, type)).toBe(true);
    },
  );

  describe('invalid HTTPS URL in online mode', () => {
    it.each(['http://example.it', 'example.it', 'ftp://example.it'])(
      'shows the URL error and blocks submit for %s',
      (websiteUrl) => {
        expect(getWebsiteUrlError(websiteUrl)).toBe(
          'Inserisci un URL valido (es. https://...)',
        );
        expect(isLocValid({ ...location, websiteUrl }, 'online')).toBe(false);
      },
    );
  });

  describe('"Campo obbligatorio" after submit', () => {
    it('shows the required error only after submit', () => {
      expect(getRequiredFieldError('', false)).toBeUndefined();
      expect(getRequiredFieldError('', true)).toBe('Campo obbligatorio');
      expect(getRequiredFieldError('   ', true)).toBe('Campo obbligatorio');
      expect(getRequiredFieldError('Roma', true)).toBeUndefined();
    });

    it('leaves an empty website URL to the required error', () => {
      expect(getWebsiteUrlError('')).toBeNull();
      expect(getRequiredFieldError('', true)).toBe('Campo obbligatorio');
    });

    it.each(['name', 'street', 'city', 'state', 'postalCode'] as const)(
      'blocks offline submit when %s is empty',
      (field) => {
        expect(isLocValid({ ...location, [field]: '   ' }, 'offline')).toBe(
          false,
        );
      },
    );

    it.each(['name', 'websiteUrl'] as const)(
      'blocks online submit when %s is empty',
      (field) => {
        expect(isLocValid({ ...location, [field]: '   ' }, 'online')).toBe(
          false,
        );
      },
    );
  });
});
