import type { ConfermaDomandaRequest } from '../../../generated/model';

export const DOCUMENT_UPLOAD_STEP_INDEX = 4;
export const SUMMARY_STEP_INDEX = 5;

export const getNextStepAfterDocumentType = (
  confirmation: ConfermaDomandaRequest,
) => {
  const documentType = confirmation.tipologiaUlterioreDocumentazione;

  if (confirmation.dichiarazioneConformitaVerbale) {
    return SUMMARY_STEP_INDEX;
  }

  if (documentType === 1 || documentType === 2 || documentType === 3) {
    return DOCUMENT_UPLOAD_STEP_INDEX;
  }

  return SUMMARY_STEP_INDEX;
};
