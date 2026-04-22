export interface AgreementAdditionalSectionsCopy {
  companion: {
    title: string;
    toggleAriaLabel: string;
    sameConditionLabel: string;
    benefitTypePlaceholder: string;
    benefitTypeOptions: Record<string, string>;
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

export interface AgreementDetailsFormCopy {
  sectionTitle: string;
  sectionDescription: string;
  nameLabel: string;
  namePlaceholder: string;
  nameHelperText: string;
  benefitTypeLabel: string;
  benefitTypePlaceholder: string;
  benefitTypeOptions: Record<string, string>;
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
