import type { Contact } from '../location/types';

export interface WebsiteFormState {
  name: string | null;
  url: string | null;
  urlError: string | null;
  contacts: Contact[];
}

export interface CreateWebsitePayload {
  name: string | null;
  url: string | null;
  contacts: Contact[];
}

export interface Website extends CreateWebsitePayload {
  id: string;
}
