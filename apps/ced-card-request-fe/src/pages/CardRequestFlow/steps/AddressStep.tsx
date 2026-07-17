import { Box } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { AppSelect, AppTextField } from '../../../components';
import { StepCard } from '../StepCard';
import type { StepRef } from '../types';
import { useAddressDataForm } from '../hooks/useAddressDataForm';
import { NuovaDomandaInBozzaRequest } from '../../../core/api/generated/model';

export const AddressStep = forwardRef<StepRef>(function AddressStep(_, ref) {
  const addressFields = useAddressDataForm();

  const [errors, setErrors] = useState<
    Partial<Record<keyof NuovaDomandaInBozzaRequest, string>>
  >({});

  const MAX_LENGTHS: Partial<Record<keyof NuovaDomandaInBozzaRequest, number>> =
    {
      indirizzoRec: 30,
      civicoRec: 10,
      datiAggiuntiviRec: 45,
    };

  useImperativeHandle(ref, () => ({
    validate() {
      const newErrors: Partial<
        Record<keyof NuovaDomandaInBozzaRequest, string>
      > = {};
      for (const item of addressFields) {
        if (!item.value.trim() && item.required) {
          newErrors[item.field] = 'Campo obbligatorio';
        }

        for (const [field, max] of Object.entries(MAX_LENGTHS)) {
          const key = field as keyof NuovaDomandaInBozzaRequest;
          if (item.field === key && item.value.length > max) {
            newErrors[key] = `Massimo ${max} caratteri`;
          }
        }
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
  }));

  return (
    <StepCard>
      <Title variant="SM" text="Dove vuoi ricevere la carta?" />
      <VSpacer />
      <Body>
        Puoi indicare anche un indirizzo diverso da quello di residenza o
        domicilio.
      </Body>

      <Box sx={{ mt: 3, display: 'grid', gap: 2.25 }}>
        {addressFields.map(({ field, type, ...rest }) => {
          const Component = type === 'text' ? AppTextField : AppSelect;
          const error = errors[field];
          return (
            <Component
              key={field}
              error={!!error}
              helperText={error}
              {...rest}
            />
          );
        })}
      </Box>
    </StepCard>
  );
});
