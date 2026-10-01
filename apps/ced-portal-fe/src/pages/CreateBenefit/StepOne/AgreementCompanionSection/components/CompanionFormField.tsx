import { FormField, FormFieldProps } from '../../../../../components';
import { getAgreementCopy } from '../../../../../constants';
import {
  selectActiveFormLanguage,
  selectFormValueByPath,
} from '../../../../../features/opportunityCreation/selectors';
import { useAppSelector } from '../../../../../hooks';
import { getFormConfig } from '../utils/agreementForm';
import { useCheckRequiredField } from '../../AgreementDetailsSection/hooks/useCheckRequiredField';

type CompanionFormFieldProps = {
  name: keyof ReturnType<typeof getFormConfig>['companion'];
  path: string;
  required?: boolean;
  attempted?: boolean;
} & Omit<FormFieldProps, 'value'>;

export const CompanionFormField = ({
  name,
  path,
  required,
  attempted,
  ...restProps
}: CompanionFormFieldProps) => {
  const activeLanguage = useAppSelector(selectActiveFormLanguage);
  const copy = getAgreementCopy(activeLanguage).detailsForm;
  const formConfig = getFormConfig(copy);
  const { placeholder, helperText, title } = formConfig.companion[name];
  const value = useAppSelector(selectFormValueByPath<string | number>(path));

  const { error, helperText: errorHelperText } = useCheckRequiredField({
    value: value != null ? String(value) : value,
    required,
    attempted,
  });

  return (
    <FormField
      value={value}
      title={title}
      label={placeholder}
      helperText={errorHelperText || helperText}
      placeholder={placeholder}
      error={error}
      {...restProps}
    />
  );
};
