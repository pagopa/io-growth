import {
  AgreementCompanionFields,
  AgreementDetailsFields,
  AgreementLocalizedFormState,
} from './types';

export const EMPTY_DETAILS: AgreementDetailsFields = {
  name: '',
  benefitType: '',
  benefitDiscountValueType: 'FIXED',
  benefitDiscountValue: '',
  otherBenefitTypeDescription: '',
  description: '',
  category: '',
  conditions: '',
};

export const EMPTY_COMPANION: AgreementCompanionFields = {
  isCompanionBenefit: false,
  isSameConditionAsOwner: false,
  companionBenefitType: '',
  companionDiscountValueType: 'FIXED',
  companionDiscountValue: '',
  companionOtherBenefitTypeDescription: '',
};

export const createEmptyLanguageFormState =
  (): AgreementLocalizedFormState => ({
    details: { ...EMPTY_DETAILS },
    companion: { ...EMPTY_COMPANION },
    hasEndDate: false,
    startDate: '',
    endDate: '',
    benefitUrl: '',
  });
