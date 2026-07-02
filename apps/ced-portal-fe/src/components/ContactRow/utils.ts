import { SupportContactCreateRequest } from '../../core/api/generated/model';
import { isValidHttpsUrl } from '../../utils';

type GetContactErrorParams = {
  contact: SupportContactCreateRequest;
  attempted: boolean;
  required?: boolean;
  isUrl?: boolean;
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
