import type { SupportContactCreateRequest } from '../../core/api/generated/model';

export interface LocationFormState {
  name: string;
  address: string;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  contacts: { type: SupportContactCreateRequest['type']; value: string }[];
}

export type LocationStringFieldKey = keyof Omit<LocationFormState, 'contacts'>;
