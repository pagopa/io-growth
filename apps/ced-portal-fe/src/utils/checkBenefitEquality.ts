import { BenefitRequest } from '../core/api/generated/model';

export const checkBenefitEquality = (
  benefit: BenefitRequest,
  companionBenefit: BenefitRequest,
): boolean => {
  switch (benefit.type) {
    case 'other':
      return (
        companionBenefit.type === 'other' &&
        benefit.description === companionBenefit.description
      );
    case 'discount':
      return (
        companionBenefit.type === 'discount' &&
        benefit.discountType === companionBenefit.discountType &&
        benefit.value === companionBenefit.value
      );
    case 'reduced_fixed_price':
      return (
        companionBenefit.type === 'reduced_fixed_price' &&
        benefit.value === companionBenefit.value
      );
    case 'free':
    case 'priority':
      return true;
  }
};
