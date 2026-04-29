import { selectFieldActiveAgreementLanguageForm } from '../../../../../features/agreementDetailCreation/selectors';
import { AgreementDetailsFieldKey } from '../../../../../features/agreementDetailCreation/types';
import { useAppSelector } from '../../../../../hooks';

type UseCheckRequiredFieldParams = {
  key: AgreementDetailsFieldKey;
  required?: boolean;
  attempted?: boolean;
};

export const useCheckRequiredField = ({
  key,
  required,
  attempted,
}: UseCheckRequiredFieldParams) => {
  const field = useAppSelector(selectFieldActiveAgreementLanguageForm(key));

  if (!required || !attempted) return { error: false, helperText: undefined };

  const isEmpty = !field.trim();
  return {
    error: isEmpty,
    helperText: isEmpty ? 'Campo obbligatorio' : undefined,
  };
};
