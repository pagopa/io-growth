import { FormField, FormFieldProps } from '../../../../../components';
import { getAgreementCopy } from '../../../../../constants';
import {
  selectFormValueByPath,
  selectActiveFormLanguage,
} from '../../../../../features/opportunityCreation/selectors';
import { useAppSelector } from '../../../../../hooks';
import { getFormConfig } from '../../AgreementCompanionSection/utils/agreementForm';
import { useCheckRequiredField } from '../hooks/useCheckRequiredField';

type DetailFormFieldProps = {
  name: keyof ReturnType<typeof getFormConfig>['detail'];
  path: string;
  required?: boolean;
  attempted?: boolean;
} & Omit<FormFieldProps, 'value'>;

export const DetailFormField = ({
  name,
  path,
  required,
  attempted,
  ...restProps
}: DetailFormFieldProps) => {
  const activeLanguage = useAppSelector(selectActiveFormLanguage);
  const copy = getAgreementCopy(activeLanguage).detailsForm;
  const formConfig = getFormConfig(copy);
  const { placeholder, helperText, title } = formConfig.detail[name];
  const value = useAppSelector(
    selectFormValueByPath<string | number | boolean | null>(path),
  );

  const finalValue = value ?? '';

  const { error, helperText: errorHelperText } = useCheckRequiredField({
    value: String(finalValue),
    required,
    attempted,
  });

  return (
    <FormField
      value={finalValue}
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
