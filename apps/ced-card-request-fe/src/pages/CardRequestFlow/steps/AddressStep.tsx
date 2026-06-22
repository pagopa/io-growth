import { Box } from '@mui/material';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { AppAutocomplete, AppTextField } from '../../../components';
import { Body, Title } from '../../../components/Typography';
import { VSpacer } from '../../../layouts/Spacer';
import { StepCard } from '../StepCard';
import type { StepRef } from '../types';

interface AddressFormState {
  provincia: string;
  comune: string;
  cap: string;
  indirizzo: string;
  civico: string;
  intercomName: string;
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
  const [form, setForm] = useState<AddressFormState>({
    provincia: '',
    comune: '',
    cap: '',
    indirizzo: '',
    civico: '',
    intercomName: '',
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
      <Title variant="SM" text="Dove vuoi ricevere la carta?" />
      <VSpacer />
      <Body>
        Puoi indicare anche un indirizzo diverso da quello di residenza o
        domicilio.
      </Body>

      <Box sx={{ mt: 3, display: 'grid', gap: 2.25 }}>
        <AppAutocomplete
          label="Provincia"
          required
          options={provinceOptions}
          inputValue={form.provincia}
          error={!!errors.provincia}
          helperText={errors.provincia}
          onValueChange={(value) => handleChange('provincia', value)}
          onSelect={(option) => handleChange('provincia', option.label)}
        />
        <AppAutocomplete
          label="Comune"
          required
          options={comuneOptions}
          inputValue={form.comune}
          error={!!errors.comune}
          helperText={errors.comune}
          onValueChange={(value) => handleChange('comune', value)}
          onSelect={(option) => handleChange('comune', option.label)}
        />
        <AppAutocomplete
          label="CAP"
          required
          options={capOptions}
          inputValue={form.cap}
          error={!!errors.cap}
          helperText={errors.cap}
          onValueChange={(value) => handleChange('cap', value)}
          onSelect={(option) => handleChange('cap', option.label)}
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
          label="Nome sul citofono"
          value={form.intercomName}
          error={!!errors.intercomName}
          helperText={errors.intercomName}
          inputProps={{ maxLength: 45 }}
          onChange={(e) => handleChange('intercomName', e.target.value)}
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
