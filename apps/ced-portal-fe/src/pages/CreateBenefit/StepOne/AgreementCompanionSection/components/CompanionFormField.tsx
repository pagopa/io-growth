import { FormField, FormFieldProps } from '../../../../../components';
import { getAgreementCopy } from '../../../../../constants';
import {
  selectActiveFormLanguage,
  selectFormValueByPath,
} from '../../../../../features/opportunityCreation/selectors';
import { useAppSelector } from '../../../../../hooks';
import { getFormConfig } from '../utils/agreementForm';

type CompanionFormFieldProps = {
  name: keyof ReturnType<typeof getFormConfig>['companion'];
  path: string;
} & Omit<FormFieldProps, 'value'>;

export const CompanionFormField = ({
  name,
  path,
  ...restProps
}: CompanionFormFieldProps) => {
  const activeLanguage = useAppSelector(selectActiveFormLanguage);
  const copy = getAgreementCopy(activeLanguage).detailsForm;
  const formConfig = getFormConfig(copy);
  const { placeholder, helperText, title } = formConfig.companion[name];
  const value = useAppSelector(selectFormValueByPath<string | number>(path));

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
