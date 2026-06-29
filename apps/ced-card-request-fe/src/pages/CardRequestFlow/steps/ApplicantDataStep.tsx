import { Box } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { forwardRef, useImperativeHandle } from 'react';
import { AppTextField } from '../../../components';
import { StepCard } from '../StepCard';
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
    useImperativeHandle(ref, () => ({
      validate: () => true,
    }));

    return (
      <StepCard>
        <Title text="Ecco a chi verrà assegnata la carta" variant="SM" />
        <VSpacer />
        <Body>Conferma i tuoi dati anagrafici.</Body>
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
      </StepCard>
    );
  },
);
