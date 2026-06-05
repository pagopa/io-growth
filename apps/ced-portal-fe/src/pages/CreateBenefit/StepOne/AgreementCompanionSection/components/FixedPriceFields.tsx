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
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import { useCallback, useMemo } from 'react';
import { getAgreementCopy } from '../../../../../constants';
import {
  BenefitDiscount,
  BenefitDiscountDiscountType,
  BenefitDiscountType,
} from '../../../../../core/api/generated/model';
import { selectActiveFormLanguage } from '../../../../../features/opportunityCreation/selectors';
import { setBenefit } from '../../../../../features/opportunityCreation/opportunityCreationSlice';

type FixedPriceFieldsProps = {
  sameValues?: boolean;
  benefit: BenefitDiscount;
};
export const FixedPriceFields = ({
  sameValues,
  benefit,
}: FixedPriceFieldsProps) => {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveFormLanguage);

  const copy = getAgreementCopy(activeLanguage).additionalSections.companion;

  const companionDiscountValueType = useMemo(
    () => benefit?.discountType,
    [benefit],
  );

  const companionDiscountValue = useMemo(() => benefit?.value, [benefit]);

  const discountIcon = useMemo(
    () =>
      companionDiscountValueType === 'percentage' ? (
        <PercentRoundedIcon sx={{ fontSize: 18 }} />
      ) : (
        <EuroRoundedIcon sx={{ fontSize: 18 }} />
      ),
    [companionDiscountValueType],
  );

  const handleChange = useCallback(
    (value: number) => {
      dispatch(
        setBenefit({
          which: 'caregiverBenefit',
          value: {
            ...benefit,
            value,
          },
        }),
      );
    },
    [benefit, dispatch],
  );

  const handleBenefitTypeChange = useCallback(
    (value: string) => {
      dispatch(
        setBenefit({
          which: 'caregiverBenefit',
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

  if (sameValues) {
    return (
      <Stack spacing={1.25} sx={{ mt: 1.25 }}>
        <RadioGroup
          row
          value={companionDiscountValueType}
          sx={{ flexWrap: 'nowrap' }}
        >
          <FormControlLabel
            value="percentage"
            disabled
            control={<Radio />}
            label={copy.discountTypeOptions.percentage}
          />
          <FormControlLabel
            value="fixed_amount"
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
            value={companionDiscountValue}
            fullWidth
          />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.25} sx={{ mt: 1.25 }}>
      <RadioGroup
        sx={{ flexWrap: 'nowrap' }}
        row
        value={companionDiscountValueType}
        onChange={(event) => handleBenefitTypeChange(event.target.value)}
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
          onChange={(event) => handleChange(Number(event.target.value))}
          fullWidth
        />
      </Stack>
    </Stack>
  );
};
