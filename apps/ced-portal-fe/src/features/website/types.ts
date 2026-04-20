import type { Contact } from '../location/types';
export type { Contact };

export interface WebsiteFormState {
  name: string;
  url: string;
  urlError: string;
  contacts: Contact[];
}

export interface CreateWebsitePayload {
  name: string;
  url: string;
  contacts: Contact[];
}

export interface Website extends CreateWebsitePayload {
  id: string;
}
