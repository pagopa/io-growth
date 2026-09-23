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

const validateFirstContact = (
  contacts: ContactFormData[],
): FirstContactErrors => {
  const firstContact = getFirstContact(contacts);

  return {
    firstContactType: firstContact.type ? '' : 'Seleziona un tipo di contatto',
    firstContactValue: !firstContact.value.trim()
      ? 'Campo obbligatorio'
      : firstContact.type === 'website' &&
          !isValidHttpsUrl(firstContact.value.trim())
        ? 'Inserisci un URL valido (es. https://...)'
        : '',
  };
};

export type CompleteDataValidationResult = {
  logoError: string;
  coverError: string;
  internalEmailError: string;
  firstContactErrors: FirstContactErrors;
  isValid: boolean;
};

export const validateCompleteDataForm = ({
  name,
  sede,
  websiteUrl,
  street,
  city,
  postalCode,
  province,
  contacts,
  internalEmail,
  logoFile,
  coverFile,
}: Pick<
  CompleteDataFormData,
  | 'name'
  | 'sede'
  | 'websiteUrl'
  | 'street'
  | 'city'
  | 'postalCode'
  | 'province'
  | 'contacts'
  | 'internalEmail'
  | 'logoFile'
  | 'coverFile'
>): CompleteDataValidationResult => {
  const nameError = name.trim() ? '' : 'Campo obbligatorio';
  const isWebsite = sede === 'sito_web';
  const isPhysical = sede === 'fisica';
  const websiteUrlError =
    isWebsite && !websiteUrl.trim() ? 'Campo obbligatorio' : '';
  const streetError = isPhysical && !street.trim() ? 'Campo obbligatorio' : '';
  const cityError = isPhysical && !city.trim() ? 'Campo obbligatorio' : '';
  const postalCodeError =
    isPhysical && !postalCode.trim() ? 'Campo obbligatorio' : '';
  const provinceError =
    isPhysical && !province.trim() ? 'Campo obbligatorio' : '';
  const logoError = logoFile ? '' : 'Campo obbligatorio';
  const coverError = coverFile ? '' : 'Campo obbligatorio';
  const internalEmailError = internalEmail.trim()
    ? ''
    : 'Indica almeno un indirizzo mail';
  const firstContactErrors = validateFirstContact(contacts);
  const isValid = [
    nameError,
    websiteUrlError,
    streetError,
    cityError,
    postalCodeError,
    provinceError,
    logoError,
    coverError,
    internalEmailError,
    firstContactErrors.firstContactType,
    firstContactErrors.firstContactValue,
  ].every((error) => !error);

  return {
    logoError,
    coverError,
    internalEmailError,
    firstContactErrors,
    isValid,
  };
};
