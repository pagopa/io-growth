import { Box, Stack } from '@mui/material';
import { AppTextField } from '../../../../../components';
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import { setLocalizedField } from '../../../../../features/agreementDetailCreation/agreementDetailCreationSlice';
import { useCallback, useMemo } from 'react';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import { AppRadioGroup } from '../../../../../components/RadioGroup';
import {
  selectActiveAgreementLanguage,
  selectFieldActiveAgreementLanguageForm,
} from '../../../../../features/agreementDetailCreation/selectors';
import { AgreementDetailsFieldKey } from '../../../../../features/agreementDetailCreation/types';
import { getAgreementCopy } from '../../../../../constants';

export const FixedPriceBenefitFields = () => {
  const dispatch = useAppDispatch();

  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);
  const copy = getAgreementCopy(activeLanguage);

  const fixedPriceBenefitType =
    copy.additionalSections.companion.benefitTypeOptions.fixedPrice;

  const otherBenefitType =
    copy.additionalSections.companion.benefitTypeOptions.other;

  const isFixedPriceBenefit =
    useAppSelector(selectFieldActiveAgreementLanguageForm('benefitType')) ===
    fixedPriceBenefitType;

  const discountType = useAppSelector(
    selectFieldActiveAgreementLanguageForm('benefitDiscountValueType'),
  );

  const discountValue = useAppSelector(
    selectFieldActiveAgreementLanguageForm('benefitDiscountValue'),
  );

  const benefitOptionalField: AgreementDetailsFieldKey = useMemo(() => {
    if (discountType === 'percentage') {
      return 'benefitDiscountValue';
    }

    return 'benefitDiscountValue';
  }, [discountType]);

  const handleBenefitTypeChange = useCallback(
    (value: string) => {
      dispatch(
        setLocalizedField({
          languageId: activeLanguage,
          field: 'benefitDiscountValueType',
          value,
        }),
      );

      if (value !== fixedPriceBenefitType) {
        dispatch(
          setLocalizedField({
            languageId: activeLanguage,
            field: 'benefitDiscountValue',
            value: '',
          }),
        );
      }

      if (value !== otherBenefitType) {
        dispatch(
          setLocalizedField({
            languageId: activeLanguage,
            field: 'otherBenefitTypeDescription',
            value: '',
          }),
        );
      }
    },
    [activeLanguage, dispatch, fixedPriceBenefitType, otherBenefitType],
  );

  const handleChange = useCallback(
    (field: AgreementDetailsFieldKey, value: string | number) => {
      dispatch(
        setLocalizedField({
          languageId: activeLanguage,
          field,
          value: String(value),
        }),
      );
    },
    [activeLanguage, dispatch],
  );

  const discountIcon = useMemo(
    () =>
      discountType === 'percentage' ? (
        <PercentRoundedIcon sx={{ fontSize: 18 }} />
      ) : (
        <EuroRoundedIcon sx={{ fontSize: 18 }} />
      ),
    [discountType],
  );
  if (!isFixedPriceBenefit) {
    return null;
  }

  const benefitPercentageError =
    discountType === 'percentage' &&
    discountValue !== '' &&
    Number(discountValue) < 10;

  return (
    <Stack spacing={1.25}>
      <AppRadioGroup
        value={discountType}
        options={[
          {
            label: copy.detailsForm.discountTypeOptions.percentage,
            value: 'percentage',
          },
          {
            label: copy.detailsForm.discountTypeOptions.fixed,
            value: 'fixed',
          },
        ]}
        onChange={(event) => handleBenefitTypeChange(event.target.value)}
      />

      <Stack direction="row" spacing={1} alignItems="stretch">
        <Box
          sx={{
            width: 56,
            height: 56,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            color: 'text.secondary',
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {discountIcon}
        </Box>
        <AppTextField
          label={copy.detailsForm.discountValueLabel}
          value={discountValue}
          error={benefitPercentageError}
          helperText={
            benefitPercentageError
              ? copy.detailsForm.discountValueError
              : undefined
          }
          onChange={(event) =>
            handleChange(benefitOptionalField, event.target.value)
          }
          fullWidth
        />
      </Stack>

      {/* <Stack direction="row" spacing={1} alignItems="stretch">
        <AppTextField
          label={copy.otherBenefitTypeLabel}
          value={otherBenefitTypeDescription}
          onChange={onChange}
          fullWidth
        />
      </Stack> */}
    </Stack>
  );
};
