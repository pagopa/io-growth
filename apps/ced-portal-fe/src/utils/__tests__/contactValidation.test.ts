import { describe, expect, it } from 'vitest';
import { getContactValidationError } from '../contactValidation.js';

describe('getContactValidationError', () => {
  it.each([
    { type: 'email', value: 'assistenza@example.it' },
    { type: 'email', value: ' nome.cognome+support@example.it ' },
    { type: 'email', value: 'support@my-organization.example.it' },
    { type: 'phone', value: '0212345678' },
    { type: 'phone', value: '+39 02 1234 5678' },
    { type: 'phone', value: '800-123-456' },
    { type: 'phone', value: '(02) 12345678' },
    { type: 'phone', value: '+39(02)12345678' },
    { type: 'phone', value: '02.1234.5678' },
    { type: 'website', value: 'https://www.example.it/assistenza' },
    { type: 'website', value: ' https://example.it ' },
  ] as const)('accepts $type: $value', (contact) => {
    expect(getContactValidationError(contact)).toBeUndefined();
  });

  it.each([
    { type: 'email', value: '12345' },
    { type: 'email', value: 'not-an-email' },
    { type: 'email', value: 'nome@example' },
    { type: 'email', value: 'nome cognome@example.it' },
    { type: 'email', value: 'nome@@example.it' },
    { type: 'email', value: 'nome@example..it' },
    { type: 'email', value: 'utente@!!!.it' },
    { type: 'email', value: 'utente@-example.it' },
    { type: 'email', value: 'utente@example-.it' },
    { type: 'email', value: 'utente@example.it/assistenza' },
    { type: 'email', value: 'utente@exam_ple.it' },
    { type: 'email', value: 'utente@.example.it' },
    { type: 'email', value: 'utente@example.it.' },
    { type: 'email', value: '.utente@example.it' },
    { type: 'email', value: 'utente.@example.it' },
    { type: 'email', value: 'nome..cognome@example.it' },
    { type: 'phone', value: 'assistenza' },
    { type: 'phone', value: '+39 02 abc123' },
    { type: 'phone', value: '123@456' },
    { type: 'phone', value: '++39123456' },
    { type: 'phone', value: '()-' },
    { type: 'phone', value: '(02 12345678' },
    { type: 'phone', value: '123--456' },
    { type: 'phone', value: '123\n456' },
    { type: 'phone', value: '((02))12345678' },
    { type: 'phone', value: '02()12345678' },
    { type: 'website', value: '12345' },
    { type: 'website', value: 'www.example.it' },
    { type: 'website', value: 'http://example.it' },
    { type: 'website', value: 'https://' },
    { type: 'email', value: '' },
    { type: 'phone', value: '   ' },
    { type: '', value: 'example' },
  ] as const)('rejects $type: $value', (contact) => {
    expect(getContactValidationError(contact)).toBeTruthy();
  });

  it('validates long malformed phone numbers without excessive backtracking', () => {
    const start = performance.now();
    for (const value of [
      `${'9'.repeat(100_000)}a`,
      `(${'9'.repeat(100_000)}`,
      `${'9 '.repeat(50_000)}a`,
    ]) {
      expect(getContactValidationError({ type: 'phone', value })).toBe(
        'Inserisci un numero di telefono valido',
      );
    }
    expect(performance.now() - start).toBeLessThan(500);
  });
});
