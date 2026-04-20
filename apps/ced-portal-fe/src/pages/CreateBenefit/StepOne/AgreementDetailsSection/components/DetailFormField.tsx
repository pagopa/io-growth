import { FormField, FormFieldProps } from '../../../../../components';
import { getAgreementCopy } from '../../../../../constants';
import {
  selectActiveAgreementLanguage,
  selectFieldActiveAgreementLanguageForm,
} from '../../../../../features/agreementDetailCreation/selectors';
import { AgreementDetailsFieldKey } from '../../../../../features/agreementDetailCreation/types';
import { useAppSelector } from '../../../../../hooks';
import { getFormConfig } from '../../AgreementCompanionSection/utils/agreementForm';

type DetailFormFieldProps = {
  name: AgreementDetailsFieldKey;
} & Omit<FormFieldProps, 'value'>;

export const DetailFormField = ({
  name,
  ...restProps
}: DetailFormFieldProps) => {
  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);
  const copy = getAgreementCopy(activeLanguage).detailsForm;
  const formConfig = getFormConfig(copy);
  const { placeholder, helperText, title } = formConfig.detail[name];
  const value = useAppSelector(selectFieldActiveAgreementLanguageForm(name));

  return (
    <FormField
      value={value}
      title={title}
      label={placeholder}
      helperText={helperText}
      placeholder={placeholder}
      {...restProps}
    />
  );
};
