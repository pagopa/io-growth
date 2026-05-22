import type { Contact } from '../places/types';

export interface LocationFormState {
  name: string;
  address: string;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  contacts: Contact[];
}

export type LocationStringFieldKey = keyof Omit<LocationFormState, 'contacts'>;
