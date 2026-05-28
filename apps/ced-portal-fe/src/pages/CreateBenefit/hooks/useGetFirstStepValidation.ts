import { BenefitRequest } from '../../../core/api/generated/model';
import { baseSelectOpportunityForm } from '../../../features/opportunityCreation/selectors';
import { useAppSelector } from '../../../hooks';

export const useGetFirstStepValidation = () => {
  const opportunityForm = useAppSelector(baseSelectOpportunityForm);

  const {
    localizedMetadata,
    beneficiaryBenefit,
    caregiverBenefit,
    dateFrom,
    dateTo,
    categoryId,
  } = opportunityForm;

  const validateLocalizedMetadata = Object.entries(localizedMetadata).every(
    ([lang, metadata]) => {
      const name = metadata?.name?.trim();
      const description = metadata?.description?.trim();
      const condition = metadata?.condition?.trim();
      const filledCount = [name, description, condition].filter(Boolean).length;

      if (lang === 'it') {
        return filledCount === 3;
      }

      return filledCount === 0 || filledCount === 3;
    },
  );

  const getValidateBenefits = (benefit: BenefitRequest | null | undefined) => {
    if (!benefit) return false;
    const { type } = benefit;
    switch (type) {
      case 'discount':
        return !!benefit.value || !!benefit.discountType;
      case 'reduced_fixed_price':
        return !!benefit.value;
      case 'other':
        return !!benefit.description;
      default:
        return false;
    }
  };

  const validateBenefits = getValidateBenefits(beneficiaryBenefit);

  const caregiverBenefitValid =
    !caregiverBenefit || getValidateBenefits(caregiverBenefit);

  const validateDates =
    !!dateFrom && !!dateTo ? new Date(dateFrom) < new Date(dateTo) : !!dateFrom;

  return (
    validateBenefits &&
    caregiverBenefitValid &&
    validateLocalizedMetadata &&
    validateDates &&
    !!categoryId
  );
};
