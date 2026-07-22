import { Box } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { forwardRef, useImperativeHandle } from 'react';
import { AppDatePicker, AppSelect, AppTextField } from '../../../components';
import { StepCard } from '../StepCard';
import type { StepRef } from '../types';
import { usePersonalDataForm } from '../hooks/usePersonalDataForm';

export const ApplicantDataStep = forwardRef<StepRef>(
  function ApplicantDataStep(_, ref) {
    useImperativeHandle(ref, () => ({
      validate: () => true,
    }));

    const personalData = usePersonalDataForm();

    return (
      <StepCard>
        <Title text="Ecco a chi verrà assegnata la carta" variant="SM" />
        <VSpacer />
        <Body>Conferma i tuoi dati anagrafici.</Body>
        <Box sx={{ mt: 3, display: 'grid', gap: 2.25 }}>
          {personalData.map(({ field, type, onChange, ...rest }) => {
            if (type === 'date') {
              return (
                <AppDatePicker
                  key={field}
                  onChange={(value) => onChange({ target: { value } })}
                  {...rest}
                />
              );
            }
            if (type === 'select') {
              return <AppSelect key={field} onChange={onChange} {...rest} />;
            }
            return <AppTextField key={field} onChange={onChange} {...rest} />;
          })}
        </Box>
      </StepCard>
    );
  },
);
