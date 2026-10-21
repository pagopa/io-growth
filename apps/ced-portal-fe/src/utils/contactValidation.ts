import type { SupportContactResponseType } from '../generated/model/index.js';
import { isValidHttpsUrl } from './urlValidator.js';

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
      return /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(trimmedValue)
        ? undefined
        : 'Inserisci un indirizzo email valido';
    case 'phone':
      return /^\+?(?:\d+|\(\d+\))(?:[ .-]?(?:\d+|\(\d+\)))*$/.test(trimmedValue)
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
