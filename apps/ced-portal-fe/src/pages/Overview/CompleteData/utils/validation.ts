import type { CompleteDataFormData, Contact } from '../types';

export type FirstContactErrors = {
  firstContactType: string;
  firstContactValue: string;
};

export const INITIAL_FIRST_CONTACT_ERRORS: FirstContactErrors = {
  firstContactType: '',
  firstContactValue: '',
};

const getFirstContact = (contacts: Contact[]): Contact =>
  contacts[0] ?? { contact: '', type: '', website: '' };

const getFirstContactValue = (contact: Contact): string =>
  contact.type === 'website' ? contact.website : contact.contact;

export const validateFirstContact = (
  contacts: Contact[],
): FirstContactErrors => {
  const firstContact = getFirstContact(contacts);

  return {
    firstContactType: firstContact.type ? '' : 'Seleziona un tipo di contatto',
    firstContactValue: getFirstContactValue(firstContact).trim()
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
