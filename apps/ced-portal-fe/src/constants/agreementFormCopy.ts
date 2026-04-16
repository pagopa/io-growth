export interface AgreementDetailsFormCopy {
  sectionTitle: string;
  sectionDescription: string;
  nameLabel: string;
  namePlaceholder: string;
  nameHelperText: string;
  benefitTypeLabel: string;
  benefitTypePlaceholder: string;
  benefitTypeOptions: {
    free: string;
    fixedPrice: string;
    priority: string;
    other: string;
  };
  discountTypeOptions: {
    percentage: string;
    fixed: string;
  };
  discountValueLabel: string;
  otherBenefitTypeLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  descriptionHelperText: string;
  categoryLabel: string;
  categoryPlaceholder: string;
  categoryOptions: string[];
  conditionsLabel: string;
  conditionsPlaceholder: string;
  conditionsHelperText: string;
}

export const AGREEMENT_DETAILS_FORM_CONFIG: Record<
  string,
  AgreementDetailsFormCopy
> = {
  it: {
    sectionTitle: "Dettagli dell'agevolazione",
    sectionDescription:
      "Inserisci i dettagli dell'agevolazione che vuoi attivare. Se vuoi, puoi anche aggiungere le traduzioni in altre lingue.",
    nameLabel: 'Nome',
    namePlaceholder: "Digita il nome dell'agevolazione",
    nameHelperText: 'Inserisci un testo di max 50 caratteri',
    benefitTypeLabel: 'Tipo di agevolazione',
    benefitTypePlaceholder: 'Seleziona una tipologia',
    benefitTypeOptions: {
      free: 'Gratuito',
      fixedPrice: 'Prezzo fisso agevolato',
      priority: 'Priorita',
      other: 'Altro',
    },
    discountTypeOptions: {
      percentage: 'Percentuale',
      fixed: 'Importo fisso',
    },
    discountValueLabel: 'Importo dello sconto',
    otherBenefitTypeLabel: 'Scrivi il tipo di agevolazione che vuoi offrire',
    descriptionLabel: 'Descrizione',
    descriptionPlaceholder: "Descrivi brevemente l'agevolazione",
    descriptionHelperText: 'Inserisci un testo di max 250 caratteri',
    categoryLabel: 'Categoria',
    categoryPlaceholder: 'Seleziona una categoria',
    categoryOptions: [
      'Cultura',
      'Mobilita',
      'Istruzione',
      'Sport e tempo libero',
    ],
    conditionsLabel: 'Condizioni',
    conditionsPlaceholder: "Specifica eventuali limitazioni dell'agevolazione",
    conditionsHelperText: 'Inserisci un testo di max 200 caratteri',
  },
  en: {
    sectionTitle: 'Benefit details',
    sectionDescription:
      'Enter the details of the benefit you want to activate. You can also add translations in other languages.',
    nameLabel: 'Name',
    namePlaceholder: 'Type the benefit name',
    nameHelperText: 'Enter a text up to 50 characters',
    benefitTypeLabel: 'Benefit type',
    benefitTypePlaceholder: 'Select a type',
    benefitTypeOptions: {
      free: 'Free',
      fixedPrice: 'Discounted fixed price',
      priority: 'Priority',
      other: 'Other',
    },
    discountTypeOptions: {
      percentage: 'Percentage',
      fixed: 'Fixed amount',
    },
    discountValueLabel: 'Discount amount',
    otherBenefitTypeLabel: 'Write the benefit type you want to offer',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Briefly describe the benefit',
    descriptionHelperText: 'Enter a text up to 250 characters',
    categoryLabel: 'Category',
    categoryPlaceholder: 'Select a category',
    categoryOptions: ['Culture', 'Mobility', 'Education', 'Sports and leisure'],
    conditionsLabel: 'Conditions',
    conditionsPlaceholder: 'Specify any benefit limitations',
    conditionsHelperText: 'Enter a text up to 200 characters',
  },
};

export const getAgreementDetailsFormCopy = (
  language: string,
): AgreementDetailsFormCopy =>
  AGREEMENT_DETAILS_FORM_CONFIG[language] ?? AGREEMENT_DETAILS_FORM_CONFIG.it;
