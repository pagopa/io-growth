import { SupportContactResponseType } from '../../core/api/generated/model';
import { isValidHttpsUrl } from '../../utils';

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
  isUrl?: boolean;
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
  isUrl,
}: GetContactErrorParams): string | undefined => {
  const requiredError = getRequiredError(attempted, required, contact.value);
  if (requiredError) return requiredError;

  if (isUrl && contact.value && !isValidHttpsUrl(contact.value)) {
    return 'Inserisci un URL valido (es. https://...)';
  }
  return undefined;
};
