import { Box } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { forwardRef, useImperativeHandle } from 'react';
import { AppDatePicker, AppSelect, AppTextField } from '../../../components';
import { StepCard } from '../StepCard';
import type { StepRef } from '../types';
import { usePersonalDataForm } from '../hooks/usePersonalDataForm';
import { useStepValidation } from '../hooks/useStepValidation';

export const ApplicantDataStep = forwardRef<StepRef>(
  function ApplicantDataStep(_, ref) {
    const personalData = usePersonalDataForm();

    const { errors, validate, resetFieldError } =
      useStepValidation(personalData);

    useImperativeHandle(ref, () => ({ validate }));

    return (
      <StepCard>
        <Title text="Ecco a chi verrà assegnata la carta" variant="SM" />
        <VSpacer />
        <Body>Conferma i tuoi dati anagrafici.</Body>
        <Box sx={{ mt: 3, display: 'grid', gap: 2.25 }}>
          {personalData.map(({ field, type, onChange, ...rest }) => {
            const error = errors[field];
            const handleChange = (e: { target: { value: unknown } }) => {
              onChange(e);
              resetFieldError(field);
            };

            if (type === 'date') {
              return (
                <AppDatePicker
                  key={field}
                  error={!!error}
                  helperText={error}
                  onChange={(value) => handleChange({ target: { value } })}
                  {...rest}
                />
              );
            }

            const Component = type === 'select' ? AppSelect : AppTextField;
            return (
              <Component
                key={field}
                error={!!error}
                helperText={error}
                onChange={handleChange}
                {...rest}
              />
            );
          })}
        </Box>
      </StepCard>
    );
  },
);
