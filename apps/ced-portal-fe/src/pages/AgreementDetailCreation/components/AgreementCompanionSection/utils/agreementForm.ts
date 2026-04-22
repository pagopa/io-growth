import { AgreementDetailsFormCopy } from '../../../../../constants';
import {
  AgreementDetailsCompanionFieldKey,
  AgreementDetailsFieldKey,
} from '../../../../../features/agreementDetailCreation/types';

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
  detail: Record<AgreementDetailsFieldKey, FormFieldConfig>;
  companion: Record<
    Exclude<
      AgreementDetailsCompanionFieldKey,
      'isSameConditionAsOwner' | 'isCompanionBenefit'
    >,
    FormFieldConfig
  >;
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

export const formFields: AgreementDetailsFieldKey[] = [
  'name',
  'benefitType',
  'benefitDiscountValue',
  'benefitDiscountValueType',
  'otherBenefitTypeDescription',
  'description',
  'category',
  'conditions',
];
