import { Box, FormControl } from '@mui/material';
import { Body, ErrorBody, Title, VSpacer } from '@pagopa/io-core-ui';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  AppRadioList,
  type RadioListOption,
} from '../../../../components/RadioList';
import {
  setField,
  DocumentTypeFormState,
  selectDocumentTypeForm,
  setForm,
} from '../../../../features/confirmation/reducer';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { StepCard } from '../../StepCard';
import type { StepRef } from '../../types';
import {
  DOCUMENT_TYPE_STEP_COPY,
  PROVINCES_OPTIONS,
  YES_NO_OPTIONS,
} from './constants';
import { toDocumentationType } from './utils';

const cascadeResets: Partial<
  Record<keyof DocumentTypeFormState, Partial<DocumentTypeFormState>>
> = {
  hasDoc: { province: null, judgment: null, inps: null },
  province: { judgment: null, inps: null },
  judgment: { inps: null },
};

const branchSpecificFieldReset = {
  allegato: null,
  nomeFile: null,
  dataSentenza: null,
  siglaProvinciaTribunale: null,
  descrizioneComuneTribunale: null,
  dirittoAccompagnatore: null,
} as const;

const scrollMap: Partial<
  Record<keyof DocumentTypeFormState, keyof DocumentTypeFormState>
> = {
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

export const DocumentTypeStep = forwardRef<StepRef>(
  function DocumentTypeStep(_, ref) {
    const dispatch = useAppDispatch();
    const form = useAppSelector(selectDocumentTypeForm);

    const [errors, setErrors] = useState<
      Partial<Record<keyof DocumentTypeFormState, string>>
    >({});
    const cardRefs = useRef<
      Partial<Record<keyof DocumentTypeFormState, HTMLDivElement | null>>
    >({});

    const cards: {
      field: keyof DocumentTypeFormState;
      title: string;
      subtitle?: string;
      options: RadioListOption[];
      visible: boolean;
    }[] = [
      {
        field: 'hasDoc',
        title: DOCUMENT_TYPE_STEP_COPY.hasDoc.title,
        subtitle: DOCUMENT_TYPE_STEP_COPY.hasDoc.subtitle,
        options: YES_NO_OPTIONS,
        visible: true,
      },
      {
        field: 'province',
        title: DOCUMENT_TYPE_STEP_COPY.province.title,
        options: PROVINCES_OPTIONS,
        visible: form.hasDoc === 'yes',
      },
      {
        field: 'judgment',
        title: DOCUMENT_TYPE_STEP_COPY.judgment.title,
        options: YES_NO_OPTIONS,
        visible: form.province === 'other',
      },
      {
        field: 'inps',
        title: DOCUMENT_TYPE_STEP_COPY.inps.title,
        options: YES_NO_OPTIONS,
        visible: form.judgment === 'no',
      },
    ];

    const handleChange = (
      field: keyof DocumentTypeFormState,
      value: string,
    ) => {
      const nextForm = {
        ...form,
        [field]: value,
        ...cascadeResets[field],
        ...branchSpecificFieldReset,
      } as DocumentTypeFormState;

      dispatch(setForm(nextForm));
      setErrors((prev) => ({ ...prev, [field]: undefined }));

      const documentType = toDocumentationType(nextForm);
      dispatch(
        setField({
          field: 'tipologiaUlterioreDocumentazione',
          value: documentType,
        }),
      );
      dispatch(
        setField({
          field: 'dichiarazioneConformitaVerbale',
          value: documentType === 1 || documentType === 3 ? true : null,
        }),
      );
      dispatch(
        setField({
          field: 'autodichiarazioneSentenza',
          value: documentType === 2 ? nextForm.judgment === 'yes' : null,
        }),
      );

      const scrollTarget = scrollMap[field];
      if (scrollTarget) {
        setTimeout(() => {
          cardRefs.current[scrollTarget]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 0);
      }
    };

    useImperativeHandle(ref, () => ({
      validate() {
        const requiredFields = cards
          .filter((c) => c.visible)
          .map((c) => c.field);

        const errs: Partial<Record<keyof DocumentTypeFormState, string>> = {};
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
            onChange={(v) => handleChange(c.field, v)}
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
