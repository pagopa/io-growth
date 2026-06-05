import { AgreementDetailsFormCopy } from '../../../../../constants';

export const benefitDiscountValueTypeOptions = [
  { label: 'Percentage', value: 'percentage' },
  { label: 'Fixed Amount', value: 'fixed' },
];

type FormFieldConfig = {
  title?: string;
  helperText?: string;
  placeholder?: string;
};

type FormConfigObject = {
  detail: Record<string, FormFieldConfig>;
  companion: Record<string, FormFieldConfig>;
};

export const getFormConfig = (
  copy: AgreementDetailsFormCopy,
): FormConfigObject => ({
  detail: {
    name: {
      title: copy.nameLabel,
      helperText: copy.nameHelperText,
      placeholder: copy.namePlaceholder,
    },
    benefitType: {
      title: copy.benefitTypeLabel,
      placeholder: copy.benefitTypePlaceholder,
      helperText: '',
    },
    benefitDiscountValueType: {
      title: '',
      placeholder: '',
      helperText: '',
    },
    benefitDiscountValue: {
      helperText: '',
      placeholder: copy.discountValueLabel,
    },
    otherBenefitTypeDescription: {
      title: '',
      helperText: '',
      placeholder: copy.otherBenefitTypeLabel,
    },
    description: {
      title: copy.descriptionLabel,
      helperText: copy.descriptionHelperText,
      placeholder: copy.descriptionPlaceholder,
    },
    category: {
      title: copy.categoryLabel,
      helperText: '',
      placeholder: copy.categoryPlaceholder,
    },
    conditions: {
      title: copy.conditionsLabel,
      helperText: copy.conditionsHelperText,
      placeholder: copy.conditionsPlaceholder,
    },
    fixedPrice: {
      title: '',
      helperText: '',
      placeholder: copy.fixedPriceLabel,
    },
  },
  companion: {
    companionBenefitType: {
      title: copy.benefitTypeLabel,
      placeholder: copy.benefitTypePlaceholder,
      helperText: '',
    },
    companionDiscountValueType: {
      title: '',
      placeholder: '',
      helperText: '',
    },
    companionDiscountValue: {
      helperText: '',
      placeholder: copy.discountValueLabel,
    },
    companionOtherBenefitTypeDescription: {
      title: '',
      helperText: '',
      placeholder: copy.otherBenefitTypeLabel,
    },
  },
});
