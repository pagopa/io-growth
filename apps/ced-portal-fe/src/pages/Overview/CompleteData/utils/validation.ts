import { isValidHttpsUrl } from '../../../../utils';
import type { CompleteDataFormData, ContactFormData } from '../types';

export type FirstContactErrors = {
  firstContactType: string;
  firstContactValue: string;
};

export const INITIAL_FIRST_CONTACT_ERRORS: FirstContactErrors = {
  firstContactType: '',
  firstContactValue: '',
};

const getFirstContact = (contacts: ContactFormData[]): ContactFormData =>
  contacts[0] ?? { type: '', value: '' };

export const validateFirstContact = (
  contacts: ContactFormData[],
): FirstContactErrors => {
  const firstContact = getFirstContact(contacts);

  return {
    firstContactType: firstContact.type ? '' : 'Seleziona un tipo di contatto',
    firstContactValue:
      firstContact.type === 'website'
        ? isValidHttpsUrl(firstContact.value.trim())
          ? ''
          : 'Inserisci un URL valido (es. https://...)'
        : firstContact.value.trim()
          ? ''
          : 'Campo obbligatorio',
  };
};

export type CompleteDataValidationResult = {
  firstContactErrors: FirstContactErrors;
  isValid: boolean;
};

export const validateCompleteDataForm = ({
  name,
  address,
  contacts,
}: Pick<
  CompleteDataFormData,
  'name' | 'address' | 'contacts'
>): CompleteDataValidationResult => {
  const nameError = name.trim() ? '' : 'Campo obbligatorio';
  const addressError = address.trim() ? '' : 'Campo obbligatorio';
  const firstContactErrors = validateFirstContact(contacts);
  const isValid = [
    nameError,
    addressError,
    firstContactErrors.firstContactType,
    firstContactErrors.firstContactValue,
  ].every((error) => !error);

  return {
    firstContactErrors,
    isValid,
  };
};
