import type { SupportContactResponseType } from '../../generated/model';
import { getContactValidationError } from '../../utils/contactValidation.js';

const getRequiredError = (
  attempted: boolean,
  required?: boolean,
  value?: string,
): string | undefined => {
  if (required && !value && attempted) {
    return 'Campo obbligatorio';
  }

  return undefined;
};

type GetContactErrorParams = {
  contact: { type: SupportContactResponseType | ''; value: string };
  attempted: boolean;
  required?: boolean;
};

export const getTypeError = ({
  attempted,
  contact,
  required,
}: GetContactErrorParams) =>
  getRequiredError(attempted, required, contact.type);

export const getContactError = ({
  attempted,
  contact,
  required,
}: GetContactErrorParams): string | undefined => {
  const requiredError = getRequiredError(
    attempted,
    required,
    contact.value.trim(),
  );
  if (requiredError) return requiredError;

  return contact.value.trim() ? getContactValidationError(contact) : undefined;
};
