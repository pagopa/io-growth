import { SupportContactResponseType } from '../../core/api/generated/model';
import { isValidHttpsUrl } from '../../utils';

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
}: GetContactErrorParams) => {
  if (!attempted) {
    return undefined;
  }
  if (required && !contact.type && attempted) return 'Campo obbligatorio';
  return undefined;
};

export const getContactError = ({
  attempted,
  contact,
  required,
  isUrl,
}: GetContactErrorParams): string | undefined => {
  if (!attempted) {
    return undefined;
  }
  if (required && !contact.value && attempted) return 'Campo obbligatorio';

  if (isUrl && contact.value && !isValidHttpsUrl(contact.value)) {
    return 'Inserisci un URL valido (es. https://...)';
  }
  return undefined;
};
