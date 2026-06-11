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
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { BenefitDetailsSection } from './components/BenefitDetailsSection';
import { getAgreementCopy } from '../../../../constants';
import {
  selectActiveFormLanguage,
  selectEnabledCaregiver,
} from '../../../../features/opportunityCreation/selectors';
import {
  cloneOwnerBenefitToCompanion,
  setCaregiverEnabled,
} from '../../../../features/opportunityCreation/opportunityCreationSlice';
import { CompanionFormField } from './components/CompanionFormField';

export const AgreementCompanionSection = () => {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveFormLanguage);

  const disabledNotLocalizedField = useMemo(
    () => activeLanguage !== 'it',
    [activeLanguage],
  );
  const [isSameAsOwner, setIsSameAsOwner] = useState(false);
  const companionCopy =
    getAgreementCopy(activeLanguage).additionalSections.companion;

  const isEnabled = useAppSelector(selectEnabledCaregiver);

  const handleToggleCompanionBenefit = useCallback(
    (checked: boolean) => {
      dispatch(setCaregiverEnabled(checked));
    },
    [dispatch],
  );

  useEffect(() => {
    if (isSameAsOwner) {
      dispatch(cloneOwnerBenefitToCompanion());
    }
  }, [dispatch, isSameAsOwner]);

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
            checked={isEnabled}
            disabled={disabledNotLocalizedField}
            onChange={(_, checked) => handleToggleCompanionBenefit(checked)}
            inputProps={{
              'aria-label': companionCopy.toggleAriaLabel,
            }}
          />
        </Stack>
        {isEnabled && (
          <>
            <FormControlLabel
              sx={{ alignItems: 'center', ml: -0.75 }}
              disabled={disabledNotLocalizedField}
              control={
                <Checkbox
                  checked={isSameAsOwner}
                  onChange={(_, checked) => {
                    setIsSameAsOwner(checked);
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: 14 }}>
                  {companionCopy.sameConditionLabel}
                </Typography>
              }
            />
            <BenefitDetailsSection isSameAsOwner={isSameAsOwner} />
          </>
        )}
      </Stack>
    </Paper>
  );
};
