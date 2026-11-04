export type LocationType = 'offline' | 'online';

export type ContactState = {
  type: 'email' | 'phone' | 'website';
  value: string;
};

export interface LocationState {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  websiteUrl: string;
  contacts: ContactState[];
}
