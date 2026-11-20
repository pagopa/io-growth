import { setField } from '../../../features/request-form/reducer';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { NuovaDomandaInBozzaRequest } from '../../../generated/model';
import { makeSelectRequestFormField } from '../../../features/request-form/selectors';
import type { ValidationRules } from './useStepValidation';

type PersonalDataFormType = {
  label: string;
  type: 'text' | 'select';
  field: keyof NuovaDomandaInBozzaRequest;
  options?: Array<{ value: string; label: string }>;
  rules?: ValidationRules;
};

const cittadinanzaOptions = [
  { label: 'Italiana', value: '0' },
  { label: 'Paesi comunitari', value: '2' },
  { label: 'Paesi extracomunitari', value: '3' },
];

const PERSONAL_DATA_FORM_CONFIG: PersonalDataFormType[] = [
  {
    label: 'Nome',
    field: 'nome',
    type: 'text',
    rules: { required: true, maxLength: 50 },
  },
  {
    label: 'Cognome',
    field: 'cognome',
    type: 'text',
    rules: { required: true, maxLength: 50 },
  },
  {
    label: 'Cittadinanza',
    field: 'idCittadinanza',
    type: 'select',
    options: cittadinanzaOptions,
    rules: { required: true },
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
