import { Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import { useCallback, useMemo } from 'react';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import { AppRadioGroup } from '../../../../../components/RadioGroup';
import {
  fixedPriceBenefitTypeOptions,
  getAgreementCopy,
} from '../../../../../constants';
import {
  selectActiveFormLanguage,
  selectBeneficiaryBenefit,
} from '../../../../../features/opportunityCreation/selectors';
import { FieldWithIcon } from './FieldWithIcon';
import {
  BenefitDiscountDiscountType,
  BenefitDiscountType,
} from '../../../../../core/api/generated/model';
import { selectFormValueByPath } from '../../../../../features/opportunityCreation/selectors';
import { setBenefit } from '../../../../../features/opportunityCreation/opportunityCreationSlice';

export const FixedPriceBenefitFields = () => {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveFormLanguage);
  const benefit = useAppSelector(selectBeneficiaryBenefit);
  const benefitDiscountType = useAppSelector(
    selectFormValueByPath<BenefitDiscountDiscountType>(
      'beneficiaryBenefit.discountType',
    ),
  );

  const benefitDiscountValue = useAppSelector(
    selectFormValueByPath<number>('beneficiaryBenefit.value'),
  );

  const handleBenefitTypeChange = useCallback(
    (value: string) => {
      dispatch(
        setBenefit({
          which: 'beneficiaryBenefit',
          value: {
            type: BenefitDiscountType.discount,
            discountType: value as BenefitDiscountDiscountType,
            value: 0,
          },
        }),
      );
    },
    [dispatch],
  );

  const handleChange = useCallback(
    (value: number) => {
      dispatch(
        setBenefit({
          which: 'beneficiaryBenefit',
          value: {
            type: BenefitDiscountType.discount,
            discountType: benefitDiscountType as BenefitDiscountDiscountType,
            value,
          },
        }),
      );
    },
    [benefitDiscountType, dispatch],
  );

  const discountIcon = useMemo(
    () =>
      benefitDiscountType === 'percentage' ? (
        <PercentRoundedIcon sx={{ fontSize: 18 }} />
      ) : (
        <EuroRoundedIcon sx={{ fontSize: 18 }} />
      ),
    [benefitDiscountType],
  );

  const copy = getAgreementCopy(activeLanguage);

  const isDiscountBenefit = benefit?.type === BenefitDiscountType.discount;

  if (!isDiscountBenefit) {
    return null;
  }

  const benefitPercentageError =
    benefitDiscountType === 'percentage' &&
    !!benefitDiscountValue &&
    benefitDiscountValue < 10;

  return (
    <Stack spacing={1.25}>
      <AppRadioGroup
        value={benefitDiscountType}
        options={fixedPriceBenefitTypeOptions}
        onChange={(event) => handleBenefitTypeChange(event.target.value)}
      />

      <FieldWithIcon
        onChange={(event) => handleChange(Number(event.target.value))}
        icon={discountIcon}
        label={copy.detailsForm.discountValueLabel}
        value={benefitDiscountValue || ''}
        error={benefitPercentageError}
        errorMessage={copy.detailsForm.discountValueError}
      />
    </Stack>
  );
};
