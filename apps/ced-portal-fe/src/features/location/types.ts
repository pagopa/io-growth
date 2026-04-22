export interface Contact {
  type: string;
  value: string;
}

export interface AddressOption {
  label: string;
  city: string;
  postalCode: string;
  province: string;
  [key: string]: unknown;
}

export interface LocationFormState {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  contacts: Contact[];
}

export interface CreateLocationPayload {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  contacts: Contact[];
}

export interface Location extends CreateLocationPayload {
  id: string;
}
