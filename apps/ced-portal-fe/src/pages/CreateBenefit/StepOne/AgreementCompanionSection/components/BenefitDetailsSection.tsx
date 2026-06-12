import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import { AppSelect, AppTextField } from '../../../../../components';
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import { DiscountFields } from './DiscountFields';
import { ViewSameConditions } from './ViewSameConditions';
import { CompanionFormField } from './CompanionFormField';
import {
  getAgreementCopy,
  getLocalizedOptions,
} from '../../../../../constants';
import {
  selectActiveFormLanguage,
  selectCaregiverBenefit,
} from '../../../../../features/opportunityCreation/selectors';
import { setBenefit } from '../../../../../features/opportunityCreation/opportunityCreationSlice';
import {
  BenefitDiscountDiscountType,
  BenefitReducedFixedPriceType,
  BenefitRequest,
} from '../../../../../core/api/generated/model';
import { useCallback, useMemo } from 'react';
import { benefitTypeMap } from '../../../../../constants/formOptions/types';
import { FieldWithIcon } from '../../AgreementDetailsSection/components/FieldWithIcon';

type BenefitDetailsSectionProps = {
  isSameAsOwner: boolean;
};

export const BenefitDetailsSection = ({
  isSameAsOwner,
}: BenefitDetailsSectionProps) => {
  const dispatch = useAppDispatch();
  const caregiverBenefit = useAppSelector(selectCaregiverBenefit);

  const activeLanguage = useAppSelector(selectActiveFormLanguage);
  const copy = getAgreementCopy(activeLanguage);
  const disabledNotLocalizedField = useMemo(
    () => activeLanguage !== 'it',
    [activeLanguage],
  );
  const benefitTypeOptions = useMemo(
    () => getLocalizedOptions(activeLanguage, 'benefit'),
    [activeLanguage],
  );

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
              which: 'caregiverBenefit',
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
        disabled={disabledNotLocalizedField}
        path="caregiverBenefit.type"
        onChange={(event) =>
          handleBenefitTypeChange(event.target.value as BenefitRequest['type'])
        }
      >
        <AppSelect options={benefitTypeOptions} />
      </CompanionFormField>
      {caregiverBenefit?.type === 'discount' && (
        <DiscountFields benefit={caregiverBenefit} />
      )}
      <CompanionFormField
        hide={
          !caregiverBenefit ||
          benefitTypeMap[activeLanguage][caregiverBenefit.type] !==
            benefitTypeMap[activeLanguage].other
        }
        disabled={disabledNotLocalizedField}
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

      <CompanionFormField
        hide={
          !caregiverBenefit ||
          benefitTypeMap[activeLanguage][caregiverBenefit.type] !==
            benefitTypeMap[activeLanguage].reduced_fixed_price
        }
        disabled={disabledNotLocalizedField}
        name={'companionFixedPrice'}
        path={'caregiverBenefit.value'}
        onChange={(event) =>
          dispatch(
            setBenefit({
              which: 'caregiverBenefit',
              value: {
                type: BenefitReducedFixedPriceType.reduced_fixed_price,
                value: Number(event.target.value),
              },
            }),
          )
        }
      >
        <FieldWithIcon
          icon={<EuroRoundedIcon sx={{ fontSize: 18 }} />}
          label={copy.detailsForm.fixedPriceLabel}
        />
      </CompanionFormField>
    </>
  );
};
