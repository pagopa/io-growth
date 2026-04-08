export type BenefitDiscountValueType = 'percentage' | 'fixed';

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

export type AgreementLocalizedDetails = Record<string, AgreementDetailsFields>;

export type AgreementDetailsFieldKey = keyof AgreementDetailsFields;
