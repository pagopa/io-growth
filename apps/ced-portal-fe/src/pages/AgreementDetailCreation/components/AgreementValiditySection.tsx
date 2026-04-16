import EventRoundedIcon from '@mui/icons-material/EventRounded';
import {
  Box,
  Paper,
  Switch,
  TextField,
  Typography,
  Stack,
} from '@mui/material';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  setEndDate,
  setHasEndDate,
  setStartDate,
} from '../../../features/agreementDetailCreation/agreementDetailCreationSlice';
import { getAgreementAdditionalSectionsCopy } from './agreementAdditionalSections.config';
import {
  selectActiveAgreementLanguage,
  selectActiveAgreementLanguageForm,
} from '../../../features/agreementDetailCreation/selectors';

export function AgreementValiditySection() {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);
  const { hasEndDate, startDate, endDate } = useAppSelector(
    selectActiveAgreementLanguageForm,
  );
  const copy = getAgreementAdditionalSectionsCopy(activeLanguage).validity;

  const renderEndDateField = useCallback(() => {
    if (!hasEndDate) {
      return <Box sx={{ display: { xs: 'none', sm: 'block' } }} />;
    }

    return (
      <Box sx={{ width: '100%' }}>
        <TextField
          type="date"
          fullWidth
          label={copy.endDateLabel}
          value={endDate}
          onChange={(event) =>
            dispatch(
              setEndDate({
                languageId: activeLanguage,
                value: event.target.value,
              }),
            )
          }
          InputLabelProps={{ shrink: true }}
        />
        <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
          {copy.dateHelperText}
        </Typography>
      </Box>
    );
  }, [
    activeLanguage,
    copy.dateHelperText,
    copy.endDateLabel,
    dispatch,
    endDate,
    hasEndDate,
  ]);

  return (
    <Paper elevation={0} sx={{ borderRadius: 2.5, p: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EventRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 600 }}>{copy.title}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            checked={hasEndDate}
            onChange={(_, checked) =>
              dispatch(
                setHasEndDate({ languageId: activeLanguage, value: checked }),
              )
            }
            inputProps={{ 'aria-label': copy.setEndDateAriaLabel }}
          />
          <Typography sx={{ fontWeight: 600 }}>
            {copy.setEndDateLabel}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          <Box sx={{ width: '100%' }}>
            <TextField
              type="date"
              fullWidth
              label={copy.startDateLabel}
              required
              value={startDate}
              onChange={(event) =>
                dispatch(
                  setStartDate({
                    languageId: activeLanguage,
                    value: event.target.value,
                  }),
                )
              }
              InputLabelProps={{ shrink: true }}
            />
            <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
              {copy.dateHelperText}
            </Typography>
          </Box>

          {renderEndDateField()}
        </Box>
      </Stack>
    </Paper>
  );
}
