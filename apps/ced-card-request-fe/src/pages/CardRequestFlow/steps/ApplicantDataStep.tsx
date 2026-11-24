import { Box } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { forwardRef, Fragment, useImperativeHandle } from 'react';
import { AppSelect, AppTextField } from '../../../components';
import { selectStatusUser } from '../../../features/status/selectors';
import { useAppSelector } from '../../../hooks';
import { StepCard } from '../StepCard';
import type { StepRef } from '../types';
import { usePersonalDataForm } from '../hooks/usePersonalDataForm';
import { useStepValidation } from '../hooks/useStepValidation';

export const ApplicantDataStep = forwardRef<StepRef>(
  function ApplicantDataStep(_, ref) {
    const personalData = usePersonalDataForm();
    const user = useAppSelector(selectStatusUser);

    const { errors, validate, resetFieldError } =
      useStepValidation(personalData);

    useImperativeHandle(ref, () => ({ validate }));

    return (
      <Fragment>
        <StepCard
          sx={{
            '& > p:not([role="heading"])': {
              fontSize: 18,
              lineHeight: '28px',
            },
            '& .MuiOutlinedInput-root, & .MuiInputBase-input': { height: 52 },
            '& .MuiOutlinedInput-root.Mui-disabled': {
              bgcolor: 'common.neutralGray',
            },
            '& .MuiInputBase-input.Mui-disabled': {
              bgcolor: 'transparent',
            },
          }}
        >
          <Title
            text="Ecco a chi verrà assegnata la carta"
            variant="MD"
            fontWeight={700}
          />
          <VSpacer />
          <Body>Conferma i tuoi dati anagrafici.</Body>
          <Box sx={{ mt: 4, display: 'grid', gap: 2.25 }}>
            {personalData
              .filter(({ field }) => field !== 'idCittadinanza')
              .map(({ field, onChange, rules, type: _type, ...rest }) => {
                const error = errors[field];
                return (
                  <AppTextField
                    key={field}
                    onChange={(e) => {
                      onChange(e);
                      resetFieldError(field);
                    }}
                    error={!!error}
                    helperText={error}
                    required={rules?.required}
                    {...rest}
                  />
                );
              })}
            <AppTextField
              label="Codice Fiscale"
              value={user?.fiscalCode ?? ''}
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </StepCard>
        <StepCard
          sx={{
            mt: 3,
            '& > p:not([role="heading"])': {
              fontSize: 18,
              lineHeight: '28px',
            },
          }}
        >
          <Title
            text="Indica la tua cittadinanza"
            variant="MD"
            fontWeight={700}
          />
          <VSpacer />
          <Body>Seleziona un’opzione</Body>
          <Box sx={{ mt: 3 }}>
            {personalData
              .filter(({ field }) => field === 'idCittadinanza')
              .map(({ field, onChange, rules, type: _type, ...rest }) => {
                const error = errors[field];
                return (
                  <AppSelect
                    key={field}
                    sx={{
                      '& .MuiOutlinedInput-root': { height: 52 },
                      '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
                        top: 26,
                        transform: 'translate(14px, -50%)',
                      },
                    }}
                    onChange={(e) => {
                      onChange(e);
                      resetFieldError(field);
                    }}
                    error={!!error}
                    helperText={error}
                    required={rules?.required}
                    {...rest}
                  />
                );
              })}
          </Box>
        </StepCard>
      </Fragment>
    );
  },
);
