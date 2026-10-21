import type { SupportContactResponseType } from '../generated/model/index.js';
import { isValidHttpsUrl } from './urlValidator.js';

const isValidEmail = (value: string): boolean => {
  const parts = value.split('@');
  if (parts.length !== 2) return false;

  const [localPart, domain] = parts;
  const labels = domain.split('.');
  return (
    localPart.length <= 64 &&
    !localPart.startsWith('.') &&
    !localPart.endsWith('.') &&
    !localPart.includes('..') &&
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart) &&
    domain.length <= 253 &&
    labels.length > 1 &&
    labels.every(
      (label) =>
        label.length <= 63 &&
        /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label),
    )
  );
};

export const getContactValidationError = ({
  type,
  value,
}: {
  type: SupportContactResponseType | '';
  value: string;
}): string | undefined => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return 'Campo obbligatorio';

  switch (type) {
    case 'email':
      return isValidEmail(trimmedValue)
        ? undefined
        : 'Inserisci un indirizzo email valido';
    case 'phone':
      return /^\+?\d+(?:[ .-]\d+)*$/.test(
        trimmedValue.replace(/\((\d+)\)/g, '$1'),
      )
        ? undefined
        : 'Inserisci un numero di telefono valido';
    case 'website':
      return isValidHttpsUrl(trimmedValue)
        ? undefined
        : 'Inserisci un URL valido (es. https://...)';
    default:
      return 'Seleziona un tipo di contatto';
  }
};
