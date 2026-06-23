import { BenefitRequest } from '../core/api/generated/model';

export const checkBenefitEquality = (
  benefit: BenefitRequest,
  companionBenefit: BenefitRequest,
): boolean => {
  if (benefit.type !== companionBenefit.type) {
    return false;
  }

  if ('description' in benefit && 'description' in companionBenefit) {
    return benefit.description === companionBenefit.description;
  }

  if ('discountType' in benefit && 'discountType' in companionBenefit) {
    return (
      benefit.discountType === companionBenefit.discountType &&
      benefit.value === companionBenefit.value
    );
  }

  if ('value' in benefit && 'value' in companionBenefit) {
    return benefit.value === companionBenefit.value;
  }

  return true;
};
