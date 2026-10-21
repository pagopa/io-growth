import { describe, expect, it } from 'vitest';
import type { CompleteDataFormData } from '../../types.js';
import { validateCompleteDataForm } from '../validation.js';

const form: CompleteDataFormData = {
  name: 'Ente',
  sede: 'sito_web',
  websiteUrl: 'https://example.it',
  street: '',
  city: '',
  postalCode: '',
  province: '',
  contacts: [{ type: 'email', value: 'assistenza@example.it' }],
  internalEmail: 'interno@example.it',
  logoFile: null,
  coverFile: null,
  privacyUrl: 'https://example.it/privacy',
  termsUrl: 'https://example.it/terms',
};

describe('validateCompleteDataForm support contacts', () => {
  it('accepts valid contacts and optional empty rows', () => {
    expect(
      validateCompleteDataForm(
        { ...form, contacts: [...form.contacts, { type: 'phone', value: '' }] },
        false,
      ).isValid,
    ).toBe(true);
  });

  it.each(['email', 'phone', 'website'] as const)(
    'rejects an invalid additional %s contact',
    (type) => {
      expect(
        validateCompleteDataForm(
          {
            ...form,
            contacts: [...form.contacts, { type, value: 'not-a-contact' }],
          },
          false,
        ).isValid,
      ).toBe(false);
    },
  );

  it('returns the validation error for the first contact', () => {
    const result = validateCompleteDataForm(
      { ...form, contacts: [{ type: 'phone', value: 'abc123' }] },
      false,
    );
    expect(result.isValid).toBe(false);
    expect(result.firstContactErrors.firstContactValue).toBe(
      'Inserisci un numero di telefono valido',
    );
  });
});
