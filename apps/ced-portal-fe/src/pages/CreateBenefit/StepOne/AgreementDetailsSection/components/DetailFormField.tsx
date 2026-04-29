import { FormField, FormFieldProps } from '../../../../../components';
import { getAgreementCopy } from '../../../../../constants';
import {
  selectActiveAgreementLanguage,
  selectFieldActiveAgreementLanguageForm,
} from '../../../../../features/agreementDetailCreation/selectors';
import { AgreementDetailsFieldKey } from '../../../../../features/agreementDetailCreation/types';
import { useAppSelector } from '../../../../../hooks';
import { getFormConfig } from '../../AgreementCompanionSection/utils/agreementForm';
import { useCheckRequiredField } from '../hooks/useCheckRequiredField';

type DetailFormFieldProps = {
  name: AgreementDetailsFieldKey;
  required?: boolean;
  attempted?: boolean;
} & Omit<FormFieldProps, 'value'>;

export const DetailFormField = ({
  name,
  required,
  attempted,
  ...restProps
}: DetailFormFieldProps) => {
  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);
  const copy = getAgreementCopy(activeLanguage).detailsForm;
  const formConfig = getFormConfig(copy);
  const { placeholder, helperText, title } = formConfig.detail[name];
  const value = useAppSelector(selectFieldActiveAgreementLanguageForm(name));

  const { error, helperText: errorHelperText } = useCheckRequiredField({
    key: name,
    required,
    attempted,
  });

  return (
    <FormField
      value={value}
      title={title}
      label={placeholder}
      required={required}
      helperText={errorHelperText || helperText}
      placeholder={placeholder}
      error={error}
      {...restProps}
    />
  );
};
