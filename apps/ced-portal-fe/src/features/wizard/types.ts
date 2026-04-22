export type Language = 'it' | 'en' | 'fr' | 'de' | 'sl';

export type AccessPoint = 'territory' | 'online' | 'both' | '';

export const LANGUAGES: Language[] = ['it', 'en', 'fr', 'de', 'sl'];

export interface TranslatedFields {
  name: string;
  description: string;
  conditions: string;
}

export interface WizardFormState {
  translations: Record<Language, TranslatedFields>;
  benefitType: string;
  discountType: 'percentage' | 'fixed';
  discountPercentage: string;
  category: string;
  startDate: string;
  endDate: string;
  endDateEnabled: boolean;
  companionEnabled: boolean;
  link: string;
  accessPoint: AccessPoint;
  nationwide: boolean;
  selectedLocationIds: string[];
  selectedWebsiteIds: string[];
}
