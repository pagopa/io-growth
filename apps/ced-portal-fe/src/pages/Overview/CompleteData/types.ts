import { SupportContactResponseType } from '../../../core/api/generated/model';

export type Contact = {
  type: SupportContactResponseType;
  value: string;
};

export type ContactFormData = {
  type: SupportContactResponseType;
  value: string;
};

export interface CompleteDataFormData {
  name: string;
  sede: 'fisica' | 'sito_web';
  address: string;
  contacts: ContactFormData[];
  logoFile: File | null;
  coverFile: File | null;
  privacyUrl: string;
  termsUrl: string;
}
