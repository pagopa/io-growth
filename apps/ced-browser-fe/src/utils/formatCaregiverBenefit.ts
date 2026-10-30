import { OpportunityBenefit } from '../generated/model';

const isSameBenefit = (
  caregiver: OpportunityBenefit,
  beneficiary?: OpportunityBenefit,
): boolean => {
  if (!beneficiary || caregiver.type !== beneficiary.type) return false;

  switch (caregiver.type) {
    case 'other':
      return Boolean(
        caregiver.description &&
        caregiver.description === beneficiary.description,
      );
    case 'discount':
      return (
        caregiver.discountType === beneficiary.discountType &&
        caregiver.value === beneficiary.value
      );
    case 'reduced_fixed_price':
      return caregiver.value === beneficiary.value;
    case 'free':
    case 'priority':
      return true;
    default:
      return false;
  }
};

export const formatCaregiverBenefit = (
  caregiverBenefit: OpportunityBenefit,
  beneficiaryBenefit?: OpportunityBenefit,
): string => {
  if (isSameBenefit(caregiverBenefit, beneficiaryBenefit)) {
    return 'Stesse condizioni del titolare';
  }

  switch (caregiverBenefit.type) {
    case 'other':
      return caregiverBenefit.description || 'Altro';
    case 'free':
      return 'Gratuito';
    case 'priority':
      return 'Priorità';
    case 'discount':
      if (caregiverBenefit.value != null) {
        return caregiverBenefit.discountType === 'fixed_amount'
          ? `-${caregiverBenefit.value}€`
          : `-${caregiverBenefit.value}%`;
      }
      return 'Sconto';
    case 'reduced_fixed_price':
      if (caregiverBenefit.value != null) {
        return `${caregiverBenefit.value}€`;
      }
      return 'Prezzo fisso agevolato';
    default:
      return caregiverBenefit.description || 'Stesse condizioni del titolare';
  }
};
