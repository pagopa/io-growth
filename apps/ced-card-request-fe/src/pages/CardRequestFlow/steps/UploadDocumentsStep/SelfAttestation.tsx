import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { StepCard } from '../../StepCard';
import { Box, FormControl } from '@mui/material';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { CompanionAvailabilityRadioGroup } from './CompanionAvailabilityRadioGroup';
import { AppDatePicker, AppSelect, AppTextField } from '../../../../components';
import { useAttestationDataForm, validateAttestationField } from './constants';
import type { StepRef } from '../../types';
import {
  makeSelectConfirmationField,
  type ConfirmationFormState,
} from '../../../../features/confirmation/reducer.js';
import { useAppSelector } from '../../../../hooks';

type FieldErrors = Partial<Record<keyof ConfirmationFormState, string>>;

export const SelfAttestation = forwardRef<StepRef>(
  function SelfAttestation(_, ref) {
    const attestationForm = useAttestationDataForm();
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const selectedCompanionValue = useAppSelector(makeSelectConfirmationField)(
      'dirittoAccompagnatore',
    );
    const [companionError, setCompanionError] = useState<string>();

    useImperativeHandle(ref, () => ({
      validate: () => {
        const errors: FieldErrors = {};
        for (const item of attestationForm) {
          const error = validateAttestationField(
            item.value,
            item.field,
            item.rules,
          );
          if (error) errors[item.field] = error;
        }

        const missingCompanion = selectedCompanionValue == null;
        setFieldErrors(errors);
        setCompanionError(
          missingCompanion ? '* Campo obbligatorio' : undefined,
        );
        return Object.keys(errors).length === 0 && !missingCompanion;
      },
    }));

    return (
      <>
        <StepCard>
          <Title variant="SM" text="Inserisci i dati della sentenza" />
          <VSpacer />
          <Body>
            Riporta le informazioni del provvedimento emesso dal tribunale.
          </Body>
          <VSpacer />
          <Box sx={{ display: 'grid', gap: 2.25 }}>
            {attestationForm.map(
              ({ field, type, rules, onChange, ...rest }) => {
                const handleChange = (e: { target: { value: unknown } }) => {
                  onChange(e);
                  setFieldErrors((previous) => ({
                    ...previous,
                    [field]: undefined,
                  }));
                };
                const errorProps = {
                  error: !!fieldErrors[field],
                  helperText: fieldErrors[field],
                };
                if (type === 'date') {
                  return (
                    <AppDatePicker
                      key={field}
                      {...errorProps}
                      required={rules?.required}
                      onChange={(value) => handleChange({ target: { value } })}
                      {...rest}
                    />
                  );
                }
                if (type === 'select') {
                  return (
                    <AppSelect
                      key={field}
                      {...errorProps}
                      required={rules?.required}
                      onChange={handleChange}
                      {...rest}
                    />
                  );
                }
                return (
                  <AppTextField
                    key={field}
                    {...errorProps}
                    required={rules?.required}
                    onChange={handleChange}
                    {...rest}
                  />
                );
              },
            )}
          </Box>
        </StepCard>
        <VSpacer size={16} />
        <StepCard>
          <Title text="Hai diritto all'accompagnatore?" variant="SM" />

          <Body>
            Devi essere in possesso di una certificazione che lo conferma.
          </Body>

          <FormControl sx={{ mt: 3, width: '100%', bgcolor: 'transparent' }}>
            <CompanionAvailabilityRadioGroup
              error={!!companionError}
              helperText={companionError}
            />
          </FormControl>
        </StepCard>
      </>
    );
  },
);
