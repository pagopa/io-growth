export interface AgreementLanguageTab {
  id: string;
  label: string;
}

export const AGREEMENT_LANGUAGE_TABS: AgreementLanguageTab[] = [
  { id: 'it', label: 'Italiano' },
  { id: 'en', label: 'Inglese' },
  { id: 'fr', label: 'Francese' },
  { id: 'de', label: 'Tedesco' },
  { id: 'sl', label: 'Sloveno' },
];

export const DEFAULT_AGREEMENT_LANGUAGE = AGREEMENT_LANGUAGE_TABS[0].id;
