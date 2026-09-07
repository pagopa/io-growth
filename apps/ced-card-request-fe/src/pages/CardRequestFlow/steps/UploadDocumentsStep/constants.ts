import {
  ConfirmationFormState,
  makeSelectConfirmationField,
  setField,
} from '../../../../features/confirmation/reducer';
import { useAppDispatch, useAppSelector } from '../../../../hooks';

export type AttestationValidationRules = {
  required?: boolean;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
};

type AttestationFormField = {
  label: string;
  field: keyof ConfirmationFormState;
  type: 'text' | 'date' | 'select';
  rules?: AttestationValidationRules;
};

export const validateAttestationField = (
  value: unknown,
  field: keyof ConfirmationFormState,
  rules?: AttestationValidationRules,
) => {
  const stringValue = String(value ?? '').trim();

  if (!stringValue) {
    return rules?.required ? 'Campo obbligatorio' : undefined;
  }

  if (field === 'siglaProvinciaTribunale') {
    if (stringValue.length !== 2) {
      return 'Inserisci la sigla di 2 lettere (es. RM)';
    }

    if (rules?.pattern && !rules.pattern.test(stringValue)) {
      return rules.patternMessage ?? 'Formato non valido';
    }
  }

  if (rules?.maxLength && stringValue.length > rules.maxLength) {
    return `Massimo ${rules.maxLength} caratteri`;
  }

  if (rules?.pattern && !rules.pattern.test(stringValue)) {
    return rules.patternMessage ?? 'Formato non valido';
  }

  return undefined;
};

export const ATTESTATION_FORM_CONFIG: AttestationFormField[] = [
  {
    label: 'Provincia',
    field: 'siglaProvinciaTribunale',
    type: 'text',
    rules: {
      required: true,
      maxLength: 2,
      pattern: /^[A-Za-z]{2}$/,
      patternMessage: 'Inserisci la sigla di 2 lettere (es. RM)',
    },
  },
  {
    label: 'Comune',
    field: 'descrizioneComuneTribunale',
    type: 'text',
    rules: { required: true, maxLength: 60 },
  },
  {
    label: 'Data di rilascio',
    field: 'dataSentenza',
    type: 'date',
    rules: { required: true },
  },
];

export const useAttestationDataForm = () => {
  const dispatch = useAppDispatch();
  const selectFieldValue = useAppSelector(makeSelectConfirmationField);

  return ATTESTATION_FORM_CONFIG.map(({ field, ...rest }) => ({
    ...rest,
    field,
    value: String(selectFieldValue(field) ?? ''),
    onChange: (e: { target: { value: unknown } }) =>
      dispatch(
        setField({
          field,
          value: String(e.target.value),
        }),
      ),
  }));
};
