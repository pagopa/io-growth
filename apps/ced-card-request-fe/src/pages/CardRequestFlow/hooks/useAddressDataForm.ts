import { setField } from '../../../features/request-form/reducer';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { NuovaDomandaInBozzaRequest } from '../../../core/api/generated/model';
import { makeSelectRequestFormField } from '../../../features/request-form/selectors';
import type { ValidationRules } from './useStepValidation';

type AddressDataFormType = ValidationRules & {
  label: string;
  type: 'text' | 'select';
  field: keyof NuovaDomandaInBozzaRequest;
  options?: Array<{ value: string; label: string }>;
};

export const ADDRESS_DATA_FORM_CONFIG: AddressDataFormType[] = [
  {
    label: 'Indirizzo',
    field: 'indirizzoRec',
    type: 'text',
    required: true,
    maxLength: 30,
  },
  {
    label: 'Civico',
    field: 'civicoRec',
    type: 'text',
    required: true,
    maxLength: 10,
  },
  {
    label: 'Comune',
    field: 'descrizioneComuneRec',
    type: 'text',
    required: true,
    maxLength: 60,
  },
  {
    label: 'Provincia',
    field: 'siglaProvinciaRec',
    type: 'text',
    required: true,
    maxLength: 2,
    pattern: /^[A-Za-z]{2}$/,
    patternMessage: 'Inserisci la sigla di 2 lettere (es. RM)',
  },
  {
    label: 'CAP',
    field: 'capRec',
    type: 'text',
    required: true,
    maxLength: 5,
  },
  {
    label: 'Nome sul citofono',
    field: 'pressoDenominazione',
    type: 'text',
    maxLength: 40,
  },
  {
    label: 'Altri dettagli',
    field: 'datiAggiuntiviRec',
    type: 'text',
    maxLength: 45,
  },
];

export const useAddressDataForm = () => {
  const dispatch = useAppDispatch();
  const selectFieldValue = useAppSelector(makeSelectRequestFormField);

  return ADDRESS_DATA_FORM_CONFIG.map(({ field, ...rest }) => ({
    ...rest,
    field,
    value: String(selectFieldValue(field) ?? ''),
    onChange: (e: { target: { value: unknown } }) =>
      dispatch(setField({ field, value: String(e.target.value) })),
  }));
};
