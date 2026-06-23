export type ContactType = 'email' | 'telephone' | 'website';

export type Contact = {
  contact: string;
  type: ContactType | '';
  website: string;
};

export interface CompleteDataFormData {
  name: string;
  sede: 'fisica' | 'sito_web';
  address: string;
  contacts: Contact[];
  logoFile: File | null;
  coverFile: File | null;
  privacyUrl: string;
  termsUrl: string;
}
