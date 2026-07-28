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

export const ADDRESS_DATA_FORM_CONFIG: AddressDataFormType[] = [
  { label: 'Indirizzo', field: 'indirizzoRec', type: 'text', required: true },
  { label: 'Civico', field: 'civicoRec', type: 'text', required: true },
  {
    label: 'Comune',
    field: 'descrizioneComuneRec',
    type: 'text',
    required: true,
  },
  {
    label: 'Provincia',
    field: 'siglaProvinciaRec',
    type: 'text',
    required: true,
  },
  {
    label: 'CAP',
    field: 'capRec',
    type: 'text',
    required: true,
  },
  {
    label: 'Nome sul citofono',
    field: 'pressoDenominazione',
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
