import { PlaceAddress } from '../core/api/generated/model';

export const formatAddress = (
  address: PlaceAddress | null | undefined,
): string => {
  if (!address) return '';

  const { street, postalCode, city, state } = address;

  const cityPart = [postalCode, city, state ? `(${state})` : '']
    .filter(Boolean)
    .join(' ')
    .trim();

  return [street, cityPart].filter(Boolean).join(', ').trim();
};
