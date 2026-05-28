import { forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { AppTextField } from '../../../components';
import type { StepRef } from '../types';

const personalData = [
  { label: 'Nome', value: 'Anna' },
  { label: 'Cognome', value: 'Verdi' },
  { label: 'Sesso', value: 'F' },
  { label: 'Data di nascita', value: '31/03/1995' },
  { label: 'Comune di nascita', value: 'Como' },
  { label: 'Provincia di nascita', value: 'CO' },
  { label: 'Stato di nascita', value: 'Italia' },
  { label: 'Codice Fiscale', value: 'VRDNNA95C71C933I' },
  { label: 'Cittadinanza', value: 'Italiana' },
];

export const ApplicantDataStep = forwardRef<StepRef>(
  function ApplicantDataStep(_, ref) {
    const theme = useTheme();

    useImperativeHandle(ref, () => ({
      validate: () => true,
    }));

    return (
      <>
        <Typography
          variant="h3"
          component="h3"
          sx={{
            color: theme.palette.common.neutralBlack,
          }}
        >
          Ecco a chi verrà assegnata la carta
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
          }}
        >
          Conferma i tuoi dati anagrafici.
        </Typography>

        <Box sx={{ mt: 3, display: 'grid', gap: 2.25 }}>
          {personalData.map((field) => (
            <AppTextField
              disabled
              key={field.label}
              label={field.label}
              value={field.value}
              InputProps={{ readOnly: true }}
            />
          ))}
        </Box>
      </>
    );
  },
);
