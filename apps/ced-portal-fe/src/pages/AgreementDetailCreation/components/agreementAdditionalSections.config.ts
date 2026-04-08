export interface AgreementAdditionalSectionsCopy {
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

export const AGREEMENT_ADDITIONAL_SECTIONS_CONFIG: Record<
  string,
  AgreementAdditionalSectionsCopy
> = {
  it: {
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
      otherBenefitTypeLabel: 'Scrivi il tipo di agevolazione che vuoi offrire',
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
  en: {
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
};

export const getAgreementAdditionalSectionsCopy = (
  language: string,
): AgreementAdditionalSectionsCopy =>
  AGREEMENT_ADDITIONAL_SECTIONS_CONFIG[language] ??
  AGREEMENT_ADDITIONAL_SECTIONS_CONFIG.it;
