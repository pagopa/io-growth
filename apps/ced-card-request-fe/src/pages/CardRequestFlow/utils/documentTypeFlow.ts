import type { ConfermaDomandaRequest } from '../../../generated/model';
import type { DocumentTypeFormState } from '../../../features/confirmation/reducer';

export const DOCUMENT_UPLOAD_STEP_INDEX = 4;
export const SUMMARY_STEP_INDEX = 5;

const requiresDocumentUpload = (documentType: number | null | undefined) =>
  documentType === 1 || documentType === 2 || documentType === 3;

export const validateDocumentTypeForm = (form: DocumentTypeFormState) => {
  const requiredFields: Array<keyof DocumentTypeFormState> = ['hasDoc'];

  if (form.hasDoc === 'yes') requiredFields.push('province');
  if (form.province === 'other') requiredFields.push('judgment');
  if (form.judgment === 'no') requiredFields.push('inps');

  return requiredFields.reduce<
    Partial<Record<keyof DocumentTypeFormState, string>>
  >((errors, field) => {
    if (form[field] === null || form[field] === undefined) {
      errors[field] = 'Campo obbligatorio';
    }
    return errors;
  }, {});
};

export const getNextStepAfterDocumentType = (
  confirmation: ConfermaDomandaRequest,
) => {
  const documentType = confirmation.tipologiaUlterioreDocumentazione;

  if (requiresDocumentUpload(documentType)) {
    return DOCUMENT_UPLOAD_STEP_INDEX;
  }

  return SUMMARY_STEP_INDEX;
};

export const getPreviousStepBeforeSummary = (
  confirmation: ConfermaDomandaRequest,
) => {
  return requiresDocumentUpload(confirmation.tipologiaUlterioreDocumentazione)
    ? DOCUMENT_UPLOAD_STEP_INDEX
    : 3;
};
