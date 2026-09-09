import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { StepCard } from '../../StepCard';
import { Box, FormControl } from '@mui/material';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { CompanionAvailabilityRadioGroup } from './CompanionAvailabilityRadioGroup';
import { AppDatePicker, AppSelect, AppTextField } from '../../../../components';
import { useAttestationDataForm, validateAttestationField } from './constants';
import type { StepRef } from '../../types';
import { useToast } from '../../../../contexts';
import { makeSelectConfirmationField } from '../../../../features/confirmation/reducer';
import { useAppSelector } from '../../../../hooks';

export const SelfAttestation = forwardRef<StepRef>(
  function SelfAttestation(_, ref) {
    const attestationForm = useAttestationDataForm();
    const { showToast } = useToast();
    const selectedCompanionValue = useAppSelector(makeSelectConfirmationField)(
      'dirittoAccompagnatore',
    );
    const [companionError, setCompanionError] = useState<string>();

    useImperativeHandle(ref, () => ({
      validate: () => {
        for (const item of attestationForm) {
          const error = validateAttestationField(
            item.value,
            item.field,
            item.rules,
          );
          if (error) {
            showToast('Completa le informazioni per continuare', 'error');
            return false;
          }
        }

        if (
          selectedCompanionValue === null ||
          selectedCompanionValue === undefined
        ) {
          setCompanionError('* Campo obbligatorio');
          showToast('Completa le informazioni per continuare', 'error');
          return false;
        }

        setCompanionError(undefined);
        return true;
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
                };
                if (type === 'date') {
                  return (
                    <AppDatePicker
                      key={field}
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
                      required={rules?.required}
                      onChange={handleChange}
                      {...rest}
                    />
                  );
                }
                return (
                  <AppTextField
                    key={field}
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
