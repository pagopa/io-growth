import { z } from 'zod';
import type { SupportContactResponseType } from '../generated/model/index.js';
import { isValidHttpsUrl } from './urlValidator.js';

const emailSchema = z.email().refine(
  (value) =>
    !value
      .slice(value.lastIndexOf('@') + 1)
      .split('.')
      .some((label) => label.endsWith('-')),
);

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
      return emailSchema.safeParse(trimmedValue).success
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
