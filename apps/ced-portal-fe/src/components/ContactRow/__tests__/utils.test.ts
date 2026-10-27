import { describe, expect, it } from 'vitest';
import { getContactError } from '../utils.js';

describe('getContactError', () => {
  it('leaves an optional empty contact valid', () => {
    expect(
      getContactError({
        contact: { type: 'email', value: '' },
        attempted: true,
      }),
    ).toBeUndefined();
  });

  it('shows a required error for whitespace after submission', () => {
    expect(
      getContactError({
        contact: { type: 'phone', value: '   ' },
        attempted: true,
        required: true,
      }),
    ).toBe('Campo obbligatorio');
  });

  it('does not show a required error before submission', () => {
    expect(
      getContactError({
        contact: { type: 'phone', value: '' },
        attempted: false,
        required: true,
      }),
    ).toBeUndefined();
  });

  it.each(['email', 'phone', 'website'] as const)(
    'shows invalid %s values even before submission',
    (type) => {
      expect(
        getContactError({
          contact: { type, value: 'not-a-contact' },
          attempted: false,
        }),
      ).toBeTruthy();
    },
  );

  it('revalidates a value when its type changes', () => {
    expect(
      getContactError({
        contact: { type: 'phone', value: '0212345678' },
        attempted: false,
      }),
    ).toBeUndefined();
    expect(
      getContactError({
        contact: { type: 'email', value: '0212345678' },
        attempted: false,
      }),
    ).toBe('Inserisci un indirizzo email valido');
  });
});
