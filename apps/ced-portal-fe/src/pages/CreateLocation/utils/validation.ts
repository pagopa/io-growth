import { isValidHttpsUrl } from '../../../utils';
import { getContactValidationError } from '../../../utils/contactValidation.js';
import type { LocationState, LocationType } from '../types';

export const getRequiredFieldError = (value: string, attempted: boolean) =>
  attempted && !value.trim() ? 'Campo obbligatorio' : undefined;

export const getWebsiteUrlError = (url: string) =>
  !url.trim() || isValidHttpsUrl(url)
    ? null
    : 'Inserisci un URL valido (es. https://...)';

export const isLocValid = (loc: LocationState, type: LocationType) => {
  if (!loc.name.trim()) return false;
  if (type === 'offline') {
    if (
      !loc.street.trim() ||
      !loc.city.trim() ||
      !loc.state.trim() ||
      !loc.postalCode.trim()
    ) {
      return false;
    }
  } else {
    if (!loc.websiteUrl.trim() || !isValidHttpsUrl(loc.websiteUrl))
      return false;
  }

  if (loc.contacts.some((contact) => getContactValidationError(contact)))
    return false;
  return true;
};
