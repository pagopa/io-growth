export type ContactType = 'email' | 'website';

export interface Contact {
  type: ContactType | null;
  value: string | null;
}

export interface AddressOption {
  label: string;
  city: string;
  postalCode: string;
  province: string;
  [key: string]: unknown;
}

export interface SupportContact {
  id: string;
  type: string;
  value: string;
}

export interface OnlinePlace {
  id: string;
  type: 'online';
  name: string;
  website: { url: string };
  supportContacts: SupportContact[];
}

export interface OfflinePlace {
  id: string;
  type: 'offline';
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  supportContacts: SupportContact[];
}

export type Place = OnlinePlace | OfflinePlace;

interface CreateSupportContact {
  type: string;
  value: string;
}

export interface CreateOnlinePlacePayload {
  type: 'online';
  name: string;
  website: { url: string };
  supportContacts: CreateSupportContact[];
}

export interface CreateOfflinePlacePayload {
  type: 'offline';
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  supportContacts: CreateSupportContact[];
}

export type CreatePlacePayload =
  | CreateOnlinePlacePayload
  | CreateOfflinePlacePayload;
