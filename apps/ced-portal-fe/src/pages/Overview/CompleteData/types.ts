export interface Contact {
  contact: string;
  type: string;
  website: string;
}

export interface CompleteDataFormData {
  name: string;
  sede: 'fisica' | 'sito_web';
  address: string;
  contacts: Contact[];
  logoFile: File | null;
  coverFile: File | null;
}
