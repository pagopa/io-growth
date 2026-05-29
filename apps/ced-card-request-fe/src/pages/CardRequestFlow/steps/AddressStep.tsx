import { forwardRef, useImperativeHandle, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { AppSelect, AppTextField } from '../../../components';
import type { StepRef } from '../types';
import { StepCard } from '../StepCard';

interface AddressFormState {
  provincia: string;
  comune: string;
  cap: string;
  indirizzo: string;
  civico: string;
  altriDettagli: string;
}

const REQUIRED_FIELDS: (keyof AddressFormState)[] = [
  'provincia',
  'comune',
  'cap',
  'indirizzo',
  'civico',
];

const provinceOptions = [
  { label: 'Milano', value: 'MI' },
  { label: 'Roma', value: 'RM' },
  { label: 'Napoli', value: 'NA' },
];

const comuneOptions = [
  { label: 'Milano', value: 'Milano' },
  { label: 'Roma', value: 'Roma' },
  { label: 'Napoli', value: 'Napoli' },
];

const capOptions = [
  { label: '20100', value: '20100' },
  { label: '00100', value: '00100' },
  { label: '80100', value: '80100' },
];

export const AddressStep = forwardRef<StepRef>(function AddressStep(_, ref) {
  const theme = useTheme();
  const [form, setForm] = useState<AddressFormState>({
    provincia: '',
    comune: '',
    cap: '',
    indirizzo: '',
    civico: '',
    altriDettagli: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressFormState, string>>
  >({});

  const MAX_LENGTHS: Partial<Record<keyof AddressFormState, number>> = {
    indirizzo: 30,
    civico: 10,
    altriDettagli: 45,
  };

  useImperativeHandle(ref, () => ({
    validate() {
      const newErrors: Partial<Record<keyof AddressFormState, string>> = {};
      for (const field of REQUIRED_FIELDS) {
        if (!form[field].trim()) {
          newErrors[field] = 'Campo obbligatorio';
        }
      }
      for (const [field, max] of Object.entries(MAX_LENGTHS)) {
        const key = field as keyof AddressFormState;
        if (form[key].length > max) {
          newErrors[key] = `Massimo ${max} caratteri`;
        }
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
  }));

  const handleChange = (field: keyof AddressFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <StepCard>
      <Typography
        variant="h3"
        component="h3"
        sx={{
          color: theme.palette.common.neutralBlack,
        }}
      >
        Dove vuoi ricevere la carta?
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: theme.palette.common.neutralDarkGray,
          fontSize: 17,
          lineHeight: 1.45,
        }}
      >
        Puoi indicare anche un indirizzo diverso da quello di residenza o
        domicilio.
      </Typography>

      <Box sx={{ mt: 3, display: 'grid', gap: 2.25 }}>
        <AppSelect
          label="Provincia"
          required
          options={provinceOptions}
          value={form.provincia}
          error={!!errors.provincia}
          helperText={errors.provincia}
          onChange={(e) => handleChange('provincia', e.target.value as string)}
        />
        <AppSelect
          label="Comune"
          required
          options={comuneOptions}
          value={form.comune}
          error={!!errors.comune}
          helperText={errors.comune}
          onChange={(e) => handleChange('comune', e.target.value as string)}
        />
        <AppSelect
          label="CAP"
          required
          options={capOptions}
          value={form.cap}
          error={!!errors.cap}
          helperText={errors.cap}
          onChange={(e) => handleChange('cap', e.target.value as string)}
        />
        <AppTextField
          label="Indirizzo"
          required
          value={form.indirizzo}
          error={!!errors.indirizzo}
          helperText={errors.indirizzo}
          inputProps={{ maxLength: 30 }}
          onChange={(e) => handleChange('indirizzo', e.target.value)}
        />
        <AppTextField
          label="Civico"
          required
          value={form.civico}
          error={!!errors.civico}
          helperText={errors.civico}
          inputProps={{ maxLength: 10 }}
          onChange={(e) => handleChange('civico', e.target.value)}
        />
        <AppTextField
          label="Altri dettagli"
          value={form.altriDettagli}
          error={!!errors.altriDettagli}
          helperText={errors.altriDettagli}
          inputProps={{ maxLength: 45 }}
          onChange={(e) => handleChange('altriDettagli', e.target.value)}
        />
      </Box>
    </StepCard>
  );
});
