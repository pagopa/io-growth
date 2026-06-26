import { Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import { useCallback, useMemo } from 'react';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import { AppRadioGroup } from '../../../../../components/RadioGroup';
import {
  getLocalizedOptions,
  getAgreementCopy,
} from '../../../../../constants';
import {
  selectActiveFormLanguage,
  selectBeneficiaryBenefit,
  selectFormValueByPath,
} from '../../../../../features/opportunityCreation/selectors';
import { FieldWithIcon } from './FieldWithIcon';
import {
  BenefitDiscountDiscountType,
  BenefitDiscountType,
} from '../../../../../core/api/generated/model';
import { setBenefit } from '../../../../../features/opportunityCreation/opportunityCreationSlice';

export const DiscountBenefitFields = () => {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveFormLanguage);
  const disabledNotLocalizedField = activeLanguage !== 'it';
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
    (value: BenefitDiscountDiscountType) => {
      dispatch(
        setBenefit({
          which: 'beneficiaryBenefit',
          value: {
            type: BenefitDiscountType.discount,
            discountType: value,
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

  const fixedPriceBenefitTypeOptions = useMemo(
    () => getLocalizedOptions(activeLanguage, 'discount'),
    [activeLanguage],
  );

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
        disabled={disabledNotLocalizedField}
        onChange={(event) =>
          handleBenefitTypeChange(
            event.target.value as BenefitDiscountDiscountType,
          )
        }
      />

      <FieldWithIcon
        disabled={disabledNotLocalizedField}
        onChange={(event) => handleChange(Number(event.target.value))}
        icon={discountIcon}
        label={
          copy.detailsForm.discountValueLabel[
            benefitDiscountType as BenefitDiscountDiscountType
          ]
        }
        value={benefitDiscountValue || ''}
        error={benefitPercentageError}
        errorMessage={copy.detailsForm.discountValueError}
      />
    </Stack>
  );
};
