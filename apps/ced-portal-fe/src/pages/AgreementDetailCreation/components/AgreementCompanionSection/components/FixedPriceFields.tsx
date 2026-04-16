import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from '@mui/material';
import { BenefitDiscountValueType } from '../../types';
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import {
  setCompanionDiscountValue,
  setCompanionDiscountValueType,
} from '../../../../../features/agreementDetailCreation/agreementDetailCreationSlice';
import { useMemo } from 'react';
import { getAgreementAdditionalSectionsCopy } from '../../agreementAdditionalSections.config';
import {
  selectActiveAgreementLanguage,
  selectFieldActiveAgreementLanguageCompanionForm,
} from '../../../../../features/agreementDetailCreation/selectors';

type FixedPriceFieldsProps = {
  sameValues?: boolean;
  values?: {
    discountValueType: BenefitDiscountValueType;
    discountValue: string;
  };
};
export const FixedPriceFields = ({
  sameValues,
  values,
}: FixedPriceFieldsProps) => {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);

  const copy = getAgreementAdditionalSectionsCopy(activeLanguage).companion;

  const isFixedPriceBenefit =
    useAppSelector(
      selectFieldActiveAgreementLanguageCompanionForm('companionBenefitType'),
    ) === copy.benefitTypeOptions.fixedPrice;

  const companionDiscountValueType = useAppSelector(
    selectFieldActiveAgreementLanguageCompanionForm(
      'companionDiscountValueType',
    ),
  );

  const companionDiscountValue = useAppSelector(
    selectFieldActiveAgreementLanguageCompanionForm('companionDiscountValue'),
  );
  const discountIcon = useMemo(
    () =>
      companionDiscountValueType === 'percentage' ? (
        <PercentRoundedIcon sx={{ fontSize: 18 }} />
      ) : (
        <EuroRoundedIcon sx={{ fontSize: 18 }} />
      ),
    [companionDiscountValueType],
  );

  if (sameValues) {
    return (
      <Stack spacing={1.25} sx={{ mt: 1.25 }}>
        <RadioGroup row value={values?.discountValueType}>
          <FormControlLabel
            value="percentage"
            disabled
            control={<Radio />}
            label={copy.discountTypeOptions.percentage}
          />
          <FormControlLabel
            value="fixed"
            disabled
            control={<Radio />}
            label={copy.discountTypeOptions.fixed}
          />
        </RadioGroup>

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
          <TextField
            disabled
            label={copy.discountValueLabel}
            value={values?.discountValue}
            fullWidth
          />
        </Stack>
      </Stack>
    );
  }

  if (!isFixedPriceBenefit) {
    return null;
  }

  return (
    <Stack spacing={1.25} sx={{ mt: 1.25 }}>
      <RadioGroup
        row
        value={companionDiscountValueType}
        onChange={(event) =>
          dispatch(
            setCompanionDiscountValueType({
              languageId: activeLanguage,
              value: event.target.value as BenefitDiscountValueType,
            }),
          )
        }
      >
        <FormControlLabel
          value="percentage"
          control={<Radio />}
          label={copy.discountTypeOptions.percentage}
        />
        <FormControlLabel
          value="fixed"
          control={<Radio />}
          label={copy.discountTypeOptions.fixed}
        />
      </RadioGroup>

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
        <TextField
          label={copy.discountValueLabel}
          value={companionDiscountValue}
          onChange={(event) =>
            dispatch(
              setCompanionDiscountValue({
                languageId: activeLanguage,
                value: event.target.value,
              }),
            )
          }
          fullWidth
        />
      </Stack>
    </Stack>
  );
};
