import { FormField, FormFieldProps } from '../../../../../components';
import { getAgreementCopy } from '../../../../../constants';
import {
  selectActiveAgreementLanguage,
  selectFieldActiveAgreementLanguageCompanionForm,
} from '../../../../../features/agreementDetailCreation/selectors';
import { AgreementDetailsCompanionFieldKey } from '../../../../../features/agreementDetailCreation/types';
import { useAppSelector } from '../../../../../hooks';
import { getFormConfig } from '../utils/agreementForm';

type CompanionFormFieldProps = {
  name: Exclude<
    AgreementDetailsCompanionFieldKey,
    'isSameConditionAsOwner' | 'isCompanionBenefit'
  >;
} & Omit<FormFieldProps, 'value'>;

export const CompanionFormField = ({
  name,
  ...restProps
}: CompanionFormFieldProps) => {
  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);
  const copy = getAgreementCopy(activeLanguage).detailsForm;
  const formConfig = getFormConfig(copy);
  const { placeholder, helperText, title } = formConfig.companion[name];
  const value = useAppSelector(
    selectFieldActiveAgreementLanguageCompanionForm(name),
  );

  return (
    <FormField
      value={value}
      placeholder={placeholder}
      helperText={helperText}
      title={title}
      {...restProps}
    />
  );
};
