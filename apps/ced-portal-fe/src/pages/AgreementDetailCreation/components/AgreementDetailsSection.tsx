import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import {
  Box,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  selectActiveAgreementLanguage,
  selectActiveAgreementLanguageForm,
  setLocalizedField,
} from '../../../features/agreementDetailCreation/agreementDetailCreationSlice';
import { AgreementLanguageTabs } from './AgreementLanguageTabs';
import { getAgreementDetailsFormCopy } from './agreementDetailsForm.config';
import type { AgreementDetailsFieldKey } from './types';
import { useCallback, useMemo } from 'react';

export function AgreementDetailsSection() {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);
  const { details } = useAppSelector(selectActiveAgreementLanguageForm);
  const copy = getAgreementDetailsFormCopy(activeLanguage);
  const benefitTypeOptions: string[] = [
    copy.benefitTypeOptions.free,
    copy.benefitTypeOptions.fixedPrice,
    copy.benefitTypeOptions.priority,
    copy.benefitTypeOptions.other,
  ];
  const isFixedPriceBenefit =
    details.benefitType === copy.benefitTypeOptions.fixedPrice;
  const isOtherBenefitType =
    details.benefitType === copy.benefitTypeOptions.other;
  const discountIcon = useMemo(
    () =>
      details.benefitDiscountValueType === 'percentage' ? (
        <PercentRoundedIcon sx={{ fontSize: 18 }} />
      ) : (
        <EuroRoundedIcon sx={{ fontSize: 18 }} />
      ),
    [details.benefitDiscountValueType],
  );

  const handleBenefitTypeChange = useCallback(
    (value: string) => {
      dispatch(
        setLocalizedField({
          languageId: activeLanguage,
          field: 'benefitType',
          value,
        }),
      );

      if (value !== copy.benefitTypeOptions.fixedPrice) {
        dispatch(
          setLocalizedField({
            languageId: activeLanguage,
            field: 'benefitDiscountValue',
            value: '',
          }),
        );
      }

      if (value !== copy.benefitTypeOptions.other) {
        dispatch(
          setLocalizedField({
            languageId: activeLanguage,
            field: 'otherBenefitTypeDescription',
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

  const handleFieldChange = useCallback(
    (field: AgreementDetailsFieldKey, value: string) => {
      dispatch(
        setLocalizedField({
          languageId: activeLanguage,
          field,
          value,
        }),
      );
    },
    [activeLanguage, dispatch],
  );

  const renderFixedPriceBenefitFields = useCallback(() => {
    if (!isFixedPriceBenefit) {
      return null;
    }

    return (
      <Stack spacing={1.25}>
        <RadioGroup
          row
          value={details.benefitDiscountValueType}
          onChange={(event) =>
            handleFieldChange(
              'benefitDiscountValueType',
              event.target.value as 'percentage' | 'fixed',
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
            value={details.benefitDiscountValue}
            onChange={(event) =>
              handleFieldChange('benefitDiscountValue', event.target.value)
            }
            fullWidth
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
    discountIcon,
    handleFieldChange,
    isFixedPriceBenefit,
  ]);

  const renderOtherBenefitTypeField = useCallback(() => {
    if (!isOtherBenefitType) {
      return null;
    }

    return (
      <TextField
        label={copy.otherBenefitTypeLabel}
        value={details.otherBenefitTypeDescription}
        onChange={(event) =>
          handleFieldChange('otherBenefitTypeDescription', event.target.value)
        }
        fullWidth
      />
    );
  }, [
    copy.otherBenefitTypeLabel,
    details.otherBenefitTypeDescription,
    handleFieldChange,
    isOtherBenefitType,
  ]);

  return (
    <Paper elevation={0} sx={{ borderRadius: 2.5, p: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: 28 }}>
            {copy.sectionTitle}
          </Typography>
          <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 14 }}>
            {copy.sectionDescription}
          </Typography>
        </Box>

        <AgreementLanguageTabs />

        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 0.75 }}>
              {copy.nameLabel}
            </Typography>
            <TextField
              label={copy.namePlaceholder}
              required
              value={details.name}
              onChange={(event) =>
                handleFieldChange('name', event.target.value)
              }
              inputProps={{ maxLength: 50 }}
              fullWidth
            />
            <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
              {copy.nameHelperText}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 600, mb: 0.75 }}>
              {copy.benefitTypeLabel}
            </Typography>
            <TextField
              select
              label={copy.benefitTypePlaceholder}
              required
              value={details.benefitType}
              onChange={(event) => handleBenefitTypeChange(event.target.value)}
              fullWidth
              InputLabelProps={{ shrink: details.benefitType.length > 0 }}
            >
              <MenuItem value="" />
              {benefitTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {renderFixedPriceBenefitFields()}
          {renderOtherBenefitTypeField()}

          <Box>
            <Typography sx={{ fontWeight: 600, mb: 0.75 }}>
              {copy.descriptionLabel}
            </Typography>
            <TextField
              label={copy.descriptionPlaceholder}
              value={details.description}
              onChange={(event) =>
                handleFieldChange('description', event.target.value)
              }
              inputProps={{ maxLength: 250 }}
              fullWidth
            />
            <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
              {copy.descriptionHelperText}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 600, mb: 0.75 }}>
              {copy.categoryLabel}
            </Typography>
            <TextField
              select
              label={copy.categoryPlaceholder}
              required
              value={details.category}
              onChange={(event) =>
                handleFieldChange('category', event.target.value)
              }
              fullWidth
              InputLabelProps={{ shrink: details.category.length > 0 }}
            >
              <MenuItem value="" />
              {copy.categoryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 600, mb: 0.75 }}>
              {copy.conditionsLabel}
            </Typography>
            <TextField
              label={copy.conditionsPlaceholder}
              value={details.conditions}
              onChange={(event) =>
                handleFieldChange('conditions', event.target.value)
              }
              inputProps={{ maxLength: 200 }}
              fullWidth
              multiline
              minRows={2}
            />
            <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
              {copy.conditionsHelperText}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}
