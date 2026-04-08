import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  selectActiveAgreementLanguage,
  selectActiveAgreementLanguageForm,
  setCompanionBenefitEnabled,
  setCompanionBenefitType,
  setCompanionDiscountValue,
  setCompanionDiscountValueType,
  setCompanionOtherBenefitTypeDescription,
  setSameConditionAsOwner,
} from '../../../features/agreementDetailCreation/agreementDetailCreationSlice';
import { getAgreementAdditionalSectionsCopy } from './agreementAdditionalSections.config';
import type { BenefitDiscountValueType } from './types';

export function AgreementCompanionSection() {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);
  const {
    isCompanionBenefit: enabled,
    isSameConditionAsOwner: sameConditionAsOwner,
    details,
    companionBenefitType,
    companionDiscountValueType,
    companionDiscountValue,
    companionOtherBenefitTypeDescription,
  } = useAppSelector(selectActiveAgreementLanguageForm);
  const copy = getAgreementAdditionalSectionsCopy(activeLanguage).companion;
  const benefitTypeOptions: string[] = useMemo(
    () => [
      copy.benefitTypeOptions.free,
      copy.benefitTypeOptions.fixedPrice,
      copy.benefitTypeOptions.priority,
      copy.benefitTypeOptions.other,
    ],
    [
      copy.benefitTypeOptions.fixedPrice,
      copy.benefitTypeOptions.free,
      copy.benefitTypeOptions.other,
      copy.benefitTypeOptions.priority,
    ],
  );
  const isFixedPriceBenefit =
    companionBenefitType === copy.benefitTypeOptions.fixedPrice;
  const isOtherBenefitType =
    companionBenefitType === copy.benefitTypeOptions.other;
  const ownerIsFixedPriceBenefit =
    details.benefitType === copy.benefitTypeOptions.fixedPrice;
  const ownerIsOtherBenefitType =
    details.benefitType === copy.benefitTypeOptions.other;
  const discountIcon = useMemo(
    () =>
      companionDiscountValueType === 'percentage' ? (
        <PercentRoundedIcon sx={{ fontSize: 18 }} />
      ) : (
        <EuroRoundedIcon sx={{ fontSize: 18 }} />
      ),
    [companionDiscountValueType],
  );
  const ownerDiscountIcon = useMemo(
    () =>
      details.benefitDiscountValueType === 'percentage' ? (
        <PercentRoundedIcon sx={{ fontSize: 18 }} />
      ) : (
        <EuroRoundedIcon sx={{ fontSize: 18 }} />
      ),
    [details.benefitDiscountValueType],
  );

  const handleCompanionBenefitTypeChange = useCallback(
    (value: string) => {
      dispatch(setCompanionBenefitType({ languageId: activeLanguage, value }));

      if (value !== copy.benefitTypeOptions.fixedPrice) {
        dispatch(
          setCompanionDiscountValue({ languageId: activeLanguage, value: '' }),
        );
      }

      if (value !== copy.benefitTypeOptions.other) {
        dispatch(
          setCompanionOtherBenefitTypeDescription({
            languageId: activeLanguage,
            value: '',
          }),
        );
      }
    },
    [
      activeLanguage,
      copy.benefitTypeOptions.fixedPrice,
      copy.benefitTypeOptions.other,
      dispatch,
    ],
  );

  const renderFixedPriceFields = useCallback(() => {
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
  }, [
    activeLanguage,
    companionDiscountValue,
    companionDiscountValueType,
    copy.discountTypeOptions.fixed,
    copy.discountTypeOptions.percentage,
    copy.discountValueLabel,
    discountIcon,
    dispatch,
    isFixedPriceBenefit,
  ]);

  const renderOtherBenefitTypeField = useCallback(() => {
    if (!isOtherBenefitType) {
      return null;
    }

    return (
      <TextField
        sx={{ mt: 1.25 }}
        label={copy.otherBenefitTypeLabel}
        value={companionOtherBenefitTypeDescription}
        onChange={(event) =>
          dispatch(
            setCompanionOtherBenefitTypeDescription({
              languageId: activeLanguage,
              value: event.target.value,
            }),
          )
        }
        fullWidth
      />
    );
  }, [
    activeLanguage,
    companionOtherBenefitTypeDescription,
    copy.otherBenefitTypeLabel,
    dispatch,
    isOtherBenefitType,
  ]);

  const renderCompanionBenefitFields = useCallback(() => {
    if (sameConditionAsOwner) {
      return null;
    }

    return (
      <Box sx={{ pl: { xs: 0, sm: 5 } }}>
        <TextField
          select
          label={copy.benefitTypePlaceholder}
          required
          fullWidth
          value={companionBenefitType}
          onChange={(event) =>
            handleCompanionBenefitTypeChange(event.target.value)
          }
          InputLabelProps={{ shrink: companionBenefitType.length > 0 }}
        >
          <MenuItem value="" />
          {benefitTypeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        {renderFixedPriceFields()}
        {renderOtherBenefitTypeField()}
      </Box>
    );
  }, [
    benefitTypeOptions,
    companionBenefitType,
    copy.benefitTypePlaceholder,
    handleCompanionBenefitTypeChange,
    renderFixedPriceFields,
    renderOtherBenefitTypeField,
    sameConditionAsOwner,
  ]);

  const renderOwnerFixedPriceFields = useCallback(() => {
    if (!ownerIsFixedPriceBenefit) {
      return null;
    }

    return (
      <Stack spacing={1.25} sx={{ mt: 1.25 }}>
        <RadioGroup row value={details.benefitDiscountValueType}>
          <FormControlLabel
            value="percentage"
            control={<Radio disabled />}
            label={copy.discountTypeOptions.percentage}
          />
          <FormControlLabel
            value="fixed"
            control={<Radio disabled />}
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
            {ownerDiscountIcon}
          </Box>
          <TextField
            label={copy.discountValueLabel}
            value={details.benefitDiscountValue}
            fullWidth
            disabled
          />
        </Stack>
      </Stack>
    );
  }, [
    copy.discountTypeOptions.fixed,
    copy.discountTypeOptions.percentage,
    copy.discountValueLabel,
    details.benefitDiscountValue,
    details.benefitDiscountValueType,
    ownerDiscountIcon,
    ownerIsFixedPriceBenefit,
  ]);

  const renderOwnerOtherBenefitTypeField = useCallback(() => {
    if (!ownerIsOtherBenefitType) {
      return null;
    }

    return (
      <TextField
        sx={{ mt: 1.25 }}
        label={copy.otherBenefitTypeLabel}
        value={details.otherBenefitTypeDescription}
        fullWidth
        disabled
      />
    );
  }, [
    copy.otherBenefitTypeLabel,
    details.otherBenefitTypeDescription,
    ownerIsOtherBenefitType,
  ]);

  const renderReadonlyOwnerFields = useCallback(() => {
    if (!sameConditionAsOwner) {
      return null;
    }

    return (
      <Box sx={{ pl: { xs: 0, sm: 5 } }}>
        <TextField
          label={copy.benefitTypePlaceholder}
          value={details.benefitType}
          fullWidth
          disabled
          InputLabelProps={{ shrink: details.benefitType.length > 0 }}
        />
        {renderOwnerFixedPriceFields()}
        {renderOwnerOtherBenefitTypeField()}
      </Box>
    );
  }, [
    copy.benefitTypePlaceholder,
    details.benefitType,
    renderOwnerFixedPriceFields,
    renderOwnerOtherBenefitTypeField,
    sameConditionAsOwner,
  ]);

  const renderCompanionContent = useCallback(() => {
    if (!enabled) {
      return null;
    }

    return (
      <Stack spacing={1.25}>
        <FormControlLabel
          sx={{ alignItems: 'center', ml: -0.75 }}
          control={
            <Checkbox
              checked={sameConditionAsOwner}
              onChange={(_, checked) =>
                dispatch(
                  setSameConditionAsOwner({
                    languageId: activeLanguage,
                    value: checked,
                  }),
                )
              }
            />
          }
          label={
            <Typography sx={{ fontSize: 14 }}>
              {copy.sameConditionLabel}
            </Typography>
          }
        />
        {renderReadonlyOwnerFields()}
        {renderCompanionBenefitFields()}
      </Stack>
    );
  }, [
    activeLanguage,
    copy.sameConditionLabel,
    dispatch,
    enabled,
    renderReadonlyOwnerFields,
    renderCompanionBenefitFields,
    sameConditionAsOwner,
  ]);

  return (
    <Paper elevation={0} sx={{ borderRadius: 2.5, p: { xs: 2, md: 3 } }}>
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <GroupsRoundedIcon sx={{ color: 'text.secondary', fontSize: 19 }} />
          <Typography sx={{ fontWeight: 600 }}>{copy.title}</Typography>
          <Box sx={{ flex: 1 }} />
          <Switch
            checked={enabled}
            onChange={(_, checked) =>
              dispatch(
                setCompanionBenefitEnabled({
                  languageId: activeLanguage,
                  value: checked,
                }),
              )
            }
            inputProps={{
              'aria-label': copy.toggleAriaLabel,
            }}
          />
        </Stack>

        {renderCompanionContent()}
      </Stack>
    </Paper>
  );
}
