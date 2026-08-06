import { Box } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { forwardRef, useImperativeHandle } from 'react';
import { AppSelect, AppTextField } from '../../../components';
import { StepCard } from '../StepCard';
import type { StepRef } from '../types';
import { useAddressDataForm } from '../hooks/useAddressDataForm';
import { useStepValidation } from '../hooks/useStepValidation';

export const AddressStep = forwardRef<StepRef>(function AddressStep(_, ref) {
  const addressFields = useAddressDataForm();

  const { errors, validate, resetFieldError } =
    useStepValidation(addressFields);

  useImperativeHandle(ref, () => ({ validate }));

  return (
    <StepCard>
      <Title variant="SM" text="Dove vuoi ricevere la carta?" />
      <VSpacer />
      <Body>
        Puoi indicare anche un indirizzo diverso da quello di residenza o
        domicilio.
      </Body>

      <Box sx={{ mt: 3, display: 'grid', gap: 2.25 }}>
        {addressFields.map(({ field, type, onChange, rules, ...rest }) => {
          const error = errors[field];
          const handleChange = (e: { target: { value: unknown } }) => {
            onChange(e);
            resetFieldError(field);
          };

          if (type === 'select') {
            return (
              <AppSelect
                key={field}
                error={!!error}
                helperText={error}
                required={rules?.required}
                onChange={handleChange}
                {...rest}
              />
            );
          }
          return (
            <AppTextField
              key={field}
              error={!!error}
              helperText={error}
              required={rules?.required}
              onChange={handleChange}
              {...rest}
            />
          );
        })}
      </Box>
    </StepCard>
  );
});
