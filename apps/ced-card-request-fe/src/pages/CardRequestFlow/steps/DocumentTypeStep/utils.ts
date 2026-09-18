import { DocumentTypeFormState } from '../../../../features/confirmation/reducer';

export const toDocumentationType = (form: DocumentTypeFormState) => {
  if (form.hasDoc === 'no') return null;

  if (
    form.province === 'trento' ||
    form.province === 'bolzano' ||
    form.province === 'aosta'
  )
    return 1;

  if (form.province === 'other') {
    if (form.judgment === 'yes') return 2;
  }

  if (form.judgment === 'no' && form.inps === 'no') return 3;

  return null;
};
