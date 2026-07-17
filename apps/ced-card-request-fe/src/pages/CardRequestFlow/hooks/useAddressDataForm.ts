import { setField } from '../../../features/request-form/reducer';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { NuovaDomandaInBozzaRequest } from '../../../core/api/generated/model';
import { makeSelectRequestFormField } from '../../../features/request-form/selectors';

type AddressDataFormType = {
  label: string;
  type: 'text' | 'select';
  field: keyof NuovaDomandaInBozzaRequest;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
};

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

export const ADDRESS_DATA_FORM_CONFIG: AddressDataFormType[] = [
  { label: 'Indirizzo', field: 'indirizzoRec', type: 'text', required: true },
  { label: 'Civico', field: 'civicoRec', type: 'text', required: true },
  {
    label: 'Comune',
    field: 'descrizioneComuneRec',
    type: 'select',
    options: comuneOptions,
    required: true,
  },
  {
    label: 'Provincia',
    field: 'siglaProvinciaRec',
    type: 'select',
    options: provinceOptions,
    required: true,
  },
  {
    label: 'CAP',
    field: 'capRec',
    type: 'select',
    options: capOptions,
    required: true,
  },
  {
    label: 'Nome sul citofono',
    field: 'pressoCognome',
    type: 'text',
  },
  { label: 'Altri dettagli', field: 'datiAggiuntiviRec', type: 'text' },
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
