import { AppSelect, AppTextField } from '../../../../../components';
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import { FixedPriceFields } from './FixedPriceFields';
import { ViewSameConditions } from './ViewSameConditions';
import { CompanionFormField } from './CompanionFormField';
import { benefitTypeOptions, getAgreementCopy } from '../../../../../constants';
import {
  selectActiveFormLanguage,
  selectCaregiverBenefit,
} from '../../../../../features/opportunityCreation/selectors';
import { setBenefit } from '../../../../../features/opportunityCreation/opportunityCreationSlice';
import {
  BenefitDiscountDiscountType,
  BenefitRequest,
} from '../../../../../core/api/generated/model';
import { useCallback } from 'react';

type BenefitDetailsSectionProps = {
  isSameAsOwner: boolean;
};

export const BenefitDetailsSection = ({
  isSameAsOwner,
}: BenefitDetailsSectionProps) => {
  const dispatch = useAppDispatch();
  const caregiverBenefit = useAppSelector(selectCaregiverBenefit);

  const activeLanguage = useAppSelector(selectActiveFormLanguage);
  const companionCopy =
    getAgreementCopy(activeLanguage).additionalSections.companion;

  const handleBenefitTypeChange = useCallback(
    (type: BenefitRequest['type']) => {
      switch (type) {
        case 'discount':
          dispatch(
            setBenefit({
              which: 'caregiverBenefit',
              value: {
                type,
                discountType: BenefitDiscountDiscountType.percentage,
                value: 0,
              },
            }),
          );
          break;
        case 'reduced_fixed_price':
          dispatch(
            setBenefit({
              which: 'caregiverBenefit',
              value: {
                type,
                value: 0,
              },
            }),
          );
          break;
        case 'other':
          dispatch(
            setBenefit({
              which: 'caregiverBenefit',
              value: {
                type,
                description: '',
              },
            }),
          );
          break;
        default:
          dispatch(
            setBenefit({
              which: 'beneficiaryBenefit',
              value: { type },
            }),
          );
      }
    },
    [dispatch],
  );
  if (isSameAsOwner) {
    return <ViewSameConditions />;
  }

  return (
    <>
      <CompanionFormField
        name={'companionBenefitType'}
        path="caregiverBenefit.type"
        onChange={(event) =>
          handleBenefitTypeChange(event.target.value as BenefitRequest['type'])
        }
      >
        <AppSelect options={benefitTypeOptions} />
      </CompanionFormField>
      {caregiverBenefit?.type === 'discount' && (
        <FixedPriceFields benefit={caregiverBenefit} />
      )}
      <CompanionFormField
        hide={caregiverBenefit?.type !== companionCopy.benefitTypeOptions.other}
        name={'companionOtherBenefitTypeDescription'}
        path="caregiverBenefit.description"
        onChange={(event) =>
          dispatch(
            setBenefit({
              which: 'caregiverBenefit',
              value: {
                type: 'other',
                description: event.target.value,
              },
            }),
          )
        }
      >
        <AppTextField fullWidth />
      </CompanionFormField>
    </>
  );
};
