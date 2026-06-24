import EventRoundedIcon from '@mui/icons-material/EventRounded';
import {
  Box,
  Paper,
  Switch,
  TextField,
  Typography,
  Stack,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { getAgreementCopy } from '../../../../constants';
import {
  selectActiveFormLanguage,
  selectDateFrom,
  selectDateTo,
} from '../../../../features/opportunityCreation/selectors';
import { setField } from '../../../../features/opportunityCreation/opportunityCreationSlice';

export function AgreementValiditySection({
  attempted,
}: Readonly<{ attempted: boolean }>) {
  const dispatch = useAppDispatch();
  const dateFrom = useAppSelector(selectDateFrom);
  const dateTo = useAppSelector(selectDateTo);

  const [hasEndDateLocal, setHasEndDateLocal] = useState(!!dateTo);

  useEffect(() => {
    if (dateTo) {
      setHasEndDateLocal(true);
    }
  }, [dateTo]);

  const activeLanguage = useAppSelector(selectActiveFormLanguage);
  const copy = getAgreementCopy(activeLanguage).additionalSections.validity;
  const disabledNotLocalizedField = useMemo(
    () => activeLanguage !== 'it',
    [activeLanguage],
  );

  const startDateError = attempted && !dateFrom.trim();

  const renderEndDateField = useCallback(() => {
    if (!hasEndDateLocal) {
      return <Box sx={{ display: { xs: 'none', sm: 'block' } }} />;
    }

    return (
      <Box sx={{ width: '100%' }}>
        <TextField
          type="date"
          disabled={disabledNotLocalizedField}
          fullWidth
          label={copy.endDateLabel}
          value={dateTo}
          onChange={(event) =>
            dispatch(
              setField({
                field: 'dateTo',
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
    copy.dateHelperText,
    copy.endDateLabel,
    dateTo,
    disabledNotLocalizedField,
    dispatch,
    hasEndDateLocal,
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
            checked={hasEndDateLocal}
            disabled={disabledNotLocalizedField}
            onChange={(_, checked) => setHasEndDateLocal(checked)}
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
              disabled={disabledNotLocalizedField}
              required
              error={startDateError}
              helperText={startDateError ? 'Campo obbligatorio' : undefined}
              value={dateFrom}
              onChange={(event) =>
                dispatch(
                  setField({
                    field: 'dateFrom',
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
