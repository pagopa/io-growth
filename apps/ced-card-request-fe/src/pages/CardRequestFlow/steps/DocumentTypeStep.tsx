import { forwardRef, useImperativeHandle, useState } from 'react';
import { Box, FormControl, Typography, useTheme } from '@mui/material';
import type { StepRef } from '../types';
import {
  AppRadioList,
  type RadioListOption,
} from '../../../components/RadioList';
import { StepCard } from '../StepCard';

type YesNo = 'yes' | 'no' | null;
type Province = 'trento' | 'bolzano' | 'aosta' | 'other' | null;

type FormState = {
  hasDoc: YesNo;
  province: Province;
  judgment: YesNo;
  inps: YesNo;
};

const provinces: RadioListOption[] = [
  { label: 'In Provincia di Trento', value: 'trento' },
  { label: 'In Provincia di Bolzano', value: 'bolzano' },
  { label: 'In Provincia di Aosta', value: 'aosta' },
  { label: "In un'altra provincia", value: 'other' },
];

const yesNo: RadioListOption[] = [
  { label: 'Sì', value: 'yes' },
  { label: 'No', value: 'no' },
];

const cascadeResets: Partial<Record<keyof FormState, Partial<FormState>>> = {
  hasDoc: { province: null, judgment: null, inps: null },
  province: { judgment: null, inps: null },
  judgment: { inps: null },
};

const itemSx = {
  width: '100%',
  mx: 0,
  py: 1.5,
};

function RadioCard({
  title,
  subtitle,
  value,
  options,
  error,
  onChange,
}: {
  title: React.ReactNode;
  subtitle?: string;
  value: string | null;
  options: RadioListOption[];
  error?: string;
  onChange: (v: string) => void;
}) {
  const theme = useTheme();

  return (
    <StepCard>
      <Typography
        variant="h3"
        component="h3"
        sx={{ color: theme.palette.common.neutralBlack }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            mt: 1,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
          }}
        >
          {subtitle}
        </Typography>
      )}

      <FormControl
        error={!!error}
        sx={{ mt: 3, width: '100%', bgcolor: 'transparent' }}
      >
        <AppRadioList
          value={value}
          options={options}
          onChange={onChange}
          divider
          itemSx={itemSx}
        />
        {error && (
          <Typography sx={{ mt: 0.5, fontSize: 14, color: 'error.main' }}>
            {error}
          </Typography>
        )}
      </FormControl>
    </StepCard>
  );
}

export const DocumentTypeStep = forwardRef<StepRef>(
  function DocumentTypeStep(_, ref) {
    const [form, setForm] = useState<FormState>({
      hasDoc: null,
      province: null,
      judgment: null,
      inps: null,
    });
    const [errors, setErrors] = useState<
      Partial<Record<keyof FormState, string>>
    >({});

    const cards: {
      field: keyof FormState;
      title: string;
      subtitle?: string;
      options: RadioListOption[];
      visible: boolean;
    }[] = [
      {
        field: 'hasDoc',
        title:
          "Hai un documento che attesta l'invalidità (verbale, sentenza, altro provvedimento giudiziario)?",
        subtitle:
          'Questa informazione ci serve per capire se puoi ottenere la carta senza dover inviare documenti aggiuntivi.',
        options: yesNo,
        visible: true,
      },
      {
        field: 'province',
        title: 'Dove ti è stato rilasciato?',
        options: provinces,
        visible: form.hasDoc === 'yes',
      },
      {
        field: 'judgment',
        title:
          "L'invalidità ti è stata riconosciuta con una sentenza o altro provvedimento giudiziario?",
        options: yesNo,
        visible: form.province === 'other',
      },
      {
        field: 'inps',
        title: "Il verbale in tuo possesso è stato rilasciato dall'INPS?",
        options: yesNo,
        visible: form.judgment === 'no',
      },
    ];

    const handleChange = (field: keyof FormState, value: string) => {
      setForm(
        (prev) =>
          ({ ...prev, [field]: value, ...cascadeResets[field] }) as FormState,
      );
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    useImperativeHandle(ref, () => ({
      validate() {
        const requiredFields = cards
          .filter((c) => c.visible)
          .map((c) => c.field);

        const errs: Partial<Record<keyof FormState, string>> = {};
        for (const field of requiredFields) {
          if (form[field] === null) errs[field] = 'Campo obbligatorio';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
      },
    }));

    const renderRadioCards = cards
      .filter((c) => c.visible)
      .map((c) => (
        <RadioCard
          key={c.field}
          title={c.title}
          subtitle={c.subtitle}
          value={form[c.field]}
          options={c.options}
          error={errors[c.field]}
          onChange={(v) => handleChange(c.field, v)}
        />
      ));

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {renderRadioCards}
      </Box>
    );
  },
);
