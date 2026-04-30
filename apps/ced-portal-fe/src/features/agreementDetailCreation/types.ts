import { FixedPriceBenefitType } from '../../constants/formOptions/types';

export type BenefitDiscountValueType = keyof typeof FixedPriceBenefitType;

export interface AgreementLocalizedFormState {
  details: AgreementDetailsFields;
  companion: AgreementCompanionFields;
  hasEndDate: boolean;
  startDate: string;
  endDate: string;
  benefitUrl: string;
}

export interface AgreementDetailsFields {
  name: string;
  benefitType: string;
  benefitDiscountValueType: BenefitDiscountValueType;
  benefitDiscountValue: string;
  otherBenefitTypeDescription: string;
  description: string;
  category: string;
  conditions: string;
}

export interface AgreementCompanionFields {
  isCompanionBenefit: boolean;
  isSameConditionAsOwner: boolean;
  companionBenefitType: string;
  companionDiscountValueType: BenefitDiscountValueType;
  companionDiscountValue: string;
  companionOtherBenefitTypeDescription: string;
}

export type AgreementLocalizedDetails = Record<string, AgreementDetailsFields>;

export type AgreementDetailsFieldKey = keyof AgreementDetailsFields;

export type AgreementDetailsCompanionFieldKey = keyof AgreementCompanionFields;
