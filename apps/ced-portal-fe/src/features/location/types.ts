import type { SupportContactCreateRequestType } from '../../core/api/generated/model';

export interface Contact {
  type: SupportContactCreateRequestType | null;
  value: string | null;
}

export interface LocationFormState {
  name: string;
  address: string;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  contacts: Contact[];
}

export type LocationStringFieldKey = keyof Omit<LocationFormState, 'contacts'>;
