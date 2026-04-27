interface AgreementAdditionalSectionsCopy {
  companion: {
    title: string;
    toggleAriaLabel: string;
    sameConditionLabel: string;
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
  };
  validity: {
    title: string;
    setEndDateLabel: string;
    setEndDateAriaLabel: string;
    startDateLabel: string;
    endDateLabel: string;
    dateHelperText: string;
  };
  link: {
    title: string;
    benefitUrlLabel: string;
  };
}

interface AgreementDetailsFormCopy {
  sectionTitle: string;
  sectionDescription: string;
  nameLabel: string;
  namePlaceholder: string;
  nameHelperText: string;
  benefitTypeLabel: string;
  benefitTypePlaceholder: string;
  discountValueLabel: string;
  otherBenefitTypeLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  descriptionHelperText: string;
  categoryLabel: string;
  categoryPlaceholder: string;
  conditionsLabel: string;
  conditionsPlaceholder: string;
  conditionsHelperText: string;
}

export interface AgreementCopy {
  detailsForm: AgreementDetailsFormCopy;
  additionalSections: AgreementAdditionalSectionsCopy;
}

export const AGREEMENT_COPY_CONFIG: Record<string, AgreementCopy> = {
  it: {
    detailsForm: {
      sectionTitle: "Dettagli dell'agevolazione",
      sectionDescription:
        "Inserisci i dettagli dell'agevolazione che vuoi attivare. Se vuoi, puoi anche aggiungere le traduzioni in altre lingue.",
      nameLabel: 'Nome',
      namePlaceholder: "Digita il nome dell'agevolazione",
      nameHelperText: 'Inserisci un testo di max 50 caratteri',
      benefitTypeLabel: 'Tipo di agevolazione',
      benefitTypePlaceholder: 'Seleziona una tipologia',
      discountValueLabel: 'Importo dello sconto',
      otherBenefitTypeLabel: 'Scrivi il tipo di agevolazione che vuoi offrire',
      descriptionLabel: 'Descrizione',
      descriptionPlaceholder: "Descrivi brevemente l'agevolazione",
      descriptionHelperText: 'Inserisci un testo di max 250 caratteri',
      categoryLabel: 'Categoria',
      categoryPlaceholder: 'Seleziona una categoria',
      conditionsLabel: 'Condizioni',
      conditionsPlaceholder:
        "Specifica eventuali limitazioni dell'agevolazione",
      conditionsHelperText: 'Inserisci un testo di max 200 caratteri',
    },
    additionalSections: {
      companion: {
        title: 'Agevolazione per accompagnatore',
        toggleAriaLabel: 'Attiva agevolazione per accompagnatore',
        sameConditionLabel: 'Stessa condizione del titolare',
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
        otherBenefitTypeLabel:
          'Scrivi il tipo di agevolazione che vuoi offrire',
      },
      validity: {
        title: 'Periodo di validita',
        setEndDateLabel: 'Imposta una data di fine',
        setEndDateAriaLabel: 'Imposta una data di fine',
        startDateLabel: 'Data inizio',
        endDateLabel: 'Data fine',
        dateHelperText: 'Indica gg/mm/aaaa',
      },
      link: {
        title: "Link dell'agevolazione",
        benefitUrlLabel:
          "Inserisci l'URL del sito dove e visibile l'agevolazione",
      },
    },
  },
  en: {
    detailsForm: {
      sectionTitle: 'Benefit details',
      sectionDescription:
        'Enter the details of the benefit you want to activate. You can also add translations in other languages.',
      nameLabel: 'Name',
      namePlaceholder: 'Type the benefit name',
      nameHelperText: 'Enter a text up to 50 characters',
      benefitTypeLabel: 'Benefit type',
      benefitTypePlaceholder: 'Select a type',
      discountValueLabel: 'Discount amount',
      otherBenefitTypeLabel: 'Write the benefit type you want to offer',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Briefly describe the benefit',
      descriptionHelperText: 'Enter a text up to 250 characters',
      categoryLabel: 'Category',
      categoryPlaceholder: 'Select a category',
      conditionsLabel: 'Conditions',
      conditionsPlaceholder: 'Specify any benefit limitations',
      conditionsHelperText: 'Enter a text up to 200 characters',
    },
    additionalSections: {
      companion: {
        title: 'Companion benefit',
        toggleAriaLabel: 'Enable companion benefit',
        sameConditionLabel: 'Same condition as owner',
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
      },
      validity: {
        title: 'Validity period',
        setEndDateLabel: 'Set an end date',
        setEndDateAriaLabel: 'Set an end date',
        startDateLabel: 'Start date',
        endDateLabel: 'End date',
        dateHelperText: 'Use dd/mm/yyyy',
      },
      link: {
        title: 'Benefit link',
        benefitUrlLabel: 'Enter the website URL where the benefit is visible',
      },
    },
  },
};

export const getAgreementCopy = (language: string): AgreementCopy =>
  AGREEMENT_COPY_CONFIG[language] ?? AGREEMENT_COPY_CONFIG.it;
