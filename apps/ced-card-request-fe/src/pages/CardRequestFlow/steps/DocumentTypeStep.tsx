import { Box, FormControl } from '@mui/material';
import { Body, ErrorBody, Title, VSpacer } from '@pagopa/io-core-ui';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  AppRadioList,
  type RadioListOption,
} from '../../../components/RadioList';
import { StepCard } from '../StepCard';
import type { StepRef } from '../types';

export type YesNo = 'yes' | 'no' | null;
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

const scrollMap: Partial<Record<keyof FormState, keyof FormState>> = {
  hasDoc: 'province',
  province: 'judgment',
  judgment: 'inps',
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
}: Readonly<{
  title: string;
  subtitle?: string;
  value: string | null;
  options: RadioListOption[];
  error?: string;
  onChange: (v: string) => void;
}>) {
  return (
    <StepCard>
      <Title text={title} variant="SM" />

      {subtitle && (
        <>
          <VSpacer />
          <Body>{subtitle}</Body>
        </>
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
        {error && <ErrorBody>{error}</ErrorBody>}
      </FormControl>
    </StepCard>
  );
}

type Props = {
  onDocChange?: (value: YesNo) => void;
};

export const DocumentTypeStep = forwardRef<StepRef, Props>(
  function DocumentTypeStep({ onDocChange }, ref) {
    const [form, setForm] = useState<FormState>({
      hasDoc: null,
      province: null,
      judgment: null,
      inps: null,
    });
    const [errors, setErrors] = useState<
      Partial<Record<keyof FormState, string>>
    >({});
    const cardRefs = useRef<
      Partial<Record<keyof FormState, HTMLDivElement | null>>
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

    const handleChange = <K extends keyof FormState>(
      field: K,
      value: FormState[K],
    ) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
        ...cascadeResets[field],
      }));

      setErrors((prev) => ({ ...prev, [field]: undefined }));

      if (field === 'hasDoc') {
        onDocChange?.(value as YesNo);
      }

      const scrollTarget = scrollMap[field];
      if (scrollTarget) {
        requestAnimationFrame(() => {
          cardRefs.current[scrollTarget]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        });
      }
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
        <Box
          key={c.field}
          ref={(el: HTMLDivElement | null) => {
            cardRefs.current[c.field] = el;
          }}
        >
          <RadioCard
            title={c.title}
            subtitle={c.subtitle}
            value={form[c.field]}
            options={c.options}
            error={errors[c.field]}
            onChange={(v) =>
              handleChange(c.field, v as FormState[typeof c.field])
            }
          />
        </Box>
      ));

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {renderRadioCards}
      </Box>
    );
  },
);
