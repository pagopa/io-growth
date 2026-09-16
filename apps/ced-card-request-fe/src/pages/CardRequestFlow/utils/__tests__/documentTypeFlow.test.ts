import { describe, expect, it } from 'vitest';

import type { ConfermaDomandaRequest } from '../../../../generated/model';
import type { DocumentTypeFormState } from '../../../../features/confirmation/reducer';

import {
  getNextStepAfterDocumentType,
  getPreviousStepBeforeSummary,
  validateDocumentTypeForm,
} from '../documentTypeFlow';

const form = (
  overrides: Partial<DocumentTypeFormState> = {},
): DocumentTypeFormState =>
  ({
    hasDoc: null,
    province: null,
    judgment: null,
    inps: null,
    ...overrides,
  }) as DocumentTypeFormState;

const confirmation = (documentType: number | null | undefined) =>
  ({
    tipologiaUlterioreDocumentazione: documentType,
  }) as ConfermaDomandaRequest;

describe('validateDocumentTypeForm', () => {
  it('requires the initial answer when the form starts empty', () => {
    expect(validateDocumentTypeForm({} as DocumentTypeFormState)).toEqual({
      hasDoc: 'Campo obbligatorio',
    });
  });

  it('does not require conditional fields when the user has no document', () => {
    expect(validateDocumentTypeForm(form({ hasDoc: 'no' }))).toEqual({});
  });

  it.each([
    [form({ hasDoc: 'yes' }), { province: 'Campo obbligatorio' }],
    [
      form({ hasDoc: 'yes', province: 'other' }),
      { judgment: 'Campo obbligatorio' },
    ],
    [
      form({ hasDoc: 'yes', province: 'other', judgment: 'no' }),
      { inps: 'Campo obbligatorio' },
    ],
  ])('requires the next field in the active branch', (value, errors) => {
    expect(validateDocumentTypeForm(value)).toEqual(errors);
  });
});

describe('document type step navigation', () => {
  it.each([1, 2, 3])(
    'uses the upload step for document type %s',
    (documentType) => {
      const value = confirmation(documentType);

      expect(getNextStepAfterDocumentType(value)).toBe(4);
      expect(getPreviousStepBeforeSummary(value)).toBe(4);
    },
  );

  it.each([null, undefined])(
    'skips the upload step when no document type is selected (%s)',
    (documentType) => {
      const value = confirmation(documentType);

      expect(getNextStepAfterDocumentType(value)).toBe(5);
      expect(getPreviousStepBeforeSummary(value)).toBe(3);
    },
  );
});
