import { setField } from '../../../features/request-form/reducer';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { NuovaDomandaInBozzaRequest } from '../../../core/api/generated/model';
import { makeSelectRequestFormField } from '../../../features/request-form/selectors';
import type { ValidationRules } from './useStepValidation';

type PersonalDataFormType = ValidationRules & {
  label: string;
  type: 'text' | 'select' | 'date';
  field: keyof NuovaDomandaInBozzaRequest;
  options?: Array<{ value: string; label: string }>;
};

const sessoOptions = [
  { label: 'F', value: 'F' },
  { label: 'M', value: 'M' },
];
const cittadinanzaOptions = [
  { label: 'Italiana', value: '0' },
  { label: 'Paesi comunitari', value: '2' },
  { label: 'Paesi extracomunitari', value: '3' },
];

export const PERSONAL_DATA_FORM_CONFIG: PersonalDataFormType[] = [
  { label: 'Nome', field: 'nome', type: 'text', maxLength: 50 },
  { label: 'Cognome', field: 'cognome', type: 'text', maxLength: 50 },
  { label: 'Sesso', field: 'sesso', type: 'select', options: sessoOptions },
  { label: 'Data di nascita', field: 'dataNascita', type: 'date' },
  {
    label: 'Comune di nascita',
    field: 'comuneNascita',
    type: 'text',
    maxLength: 60,
  },
  {
    label: 'Provincia di nascita',
    field: 'siglaProvinciaNascita',
    type: 'text',
    maxLength: 2,
    pattern: /^[A-Za-z]{2}$/,
    patternMessage: 'Inserisci la sigla di 2 lettere (es. RM)',
  },
  {
    label: 'Stato di nascita',
    field: 'statoNascita',
    type: 'text',
    maxLength: 60,
  },
  {
    label: 'Cittadinanza',
    field: 'idCittadinanza',
    type: 'select',
    options: cittadinanzaOptions,
  },
];

export const usePersonalDataForm = () => {
  const dispatch = useAppDispatch();
  const selectFieldValue = useAppSelector(makeSelectRequestFormField);

  return PERSONAL_DATA_FORM_CONFIG.map(({ field, ...rest }) => ({
    ...rest,
    field,
    value: String(selectFieldValue(field) ?? ''),
    onChange: (e: { target: { value: unknown } }) => {
      const value = e.target.value;

      dispatch(
        setField({
          field,
          value: field === 'idCittadinanza' ? Number(value) : String(value),
        }),
      );
    },
  }));
};
