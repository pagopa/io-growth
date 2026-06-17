import { PlaceAddress } from '../core/api/generated/model';

/**
 * Genera una stringa formattata leggibile a partire da un oggetto PlaceAddress.
 * Esempio: "Piazza del Campidoglio 1, 00186 Roma (RM)"
 */
export const formatAddress = (
  address: PlaceAddress | null | undefined,
): string => {
  if (!address) return '';

  const { street, postalCode, city, state } = address;

  // Costruisce la parte finale: "00186 Roma (RM)" gestendo eventuali campi mancanti
  const cityPart = [postalCode, city, state ? `(${state})` : '']
    .filter(Boolean)
    .join(' ')
    .trim();

  // Unisce la via con la parte della città: "Via, Città"
  return [street, cityPart].filter(Boolean).join(', ').trim();
};
