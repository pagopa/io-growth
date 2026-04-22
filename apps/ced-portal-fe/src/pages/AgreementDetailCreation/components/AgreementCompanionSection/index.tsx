import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../../hooks';
import {
  setCompanionBenefitEnabled,
  setLocalizedCompanionField,
  setSameConditionAsOwner,
} from '../../../../features/agreementDetailCreation/agreementDetailCreationSlice';
import {
  selectActiveAgreementLanguage,
  selectFieldActiveAgreementLanguageCompanionForm,
} from '../../../../features/agreementDetailCreation/selectors';
import { AgreementLocalizedFormState } from '../../../../features/agreementDetailCreation/types';
import { BenefitDetailsSection } from './components/BenefitDetailsSection';
import { getAgreementCopy } from '../../../../constants';

export const AgreementCompanionSection = () => {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);
  const companionCopy =
    getAgreementCopy(activeLanguage).additionalSections.companion;

  const isCompanionBenefit = useAppSelector(
    selectFieldActiveAgreementLanguageCompanionForm('isCompanionBenefit'),
  );

  const sameConditionAsOwner = useAppSelector(
    selectFieldActiveAgreementLanguageCompanionForm('isSameConditionAsOwner'),
  );
  const handleFieldChange = useCallback(
    (
      field: keyof AgreementLocalizedFormState['companion'],
      value: string | number,
    ) => {
      dispatch(
        setLocalizedCompanionField({
          languageId: activeLanguage,
          field,
          value: String(value),
        }),
      );
    },
    [activeLanguage, dispatch],
  );

  const handleToggleCompanionBenefit = useCallback(
    (checked: boolean) => {
      dispatch(
        setCompanionBenefitEnabled({
          languageId: activeLanguage,
          value: checked,
        }),
      );
    },
    [activeLanguage, dispatch],
  );

  return (
    <Paper elevation={0} sx={{ borderRadius: 2.5, p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <GroupsRoundedIcon sx={{ color: 'text.secondary', fontSize: 19 }} />
          <Typography sx={{ fontWeight: 600 }}>
            {companionCopy.title}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Switch
            checked={isCompanionBenefit}
            onChange={(_, checked) => handleToggleCompanionBenefit(checked)}
            inputProps={{
              'aria-label': companionCopy.toggleAriaLabel,
            }}
          />
        </Stack>
        {isCompanionBenefit && (
          <>
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
                  {companionCopy.sameConditionLabel}
                </Typography>
              }
            />
            <BenefitDetailsSection handleFieldChange={handleFieldChange} />
          </>
        )}
      </Stack>
    </Paper>
  );
};
