import { AppSelect, AppTextField } from '../../../../../components';
import { useAppSelector } from '../../../../../hooks';
import {
  selectActiveAgreementLanguage,
  selectFieldActiveAgreementLanguageCompanionForm,
} from '../../../../../features/agreementDetailCreation/selectors';
import { AgreementLocalizedFormState } from '../../../../../features/agreementDetailCreation/types';
import { FixedPriceFields } from './FixedPriceFields';
import { ViewSameConditions } from './ViewSameConditions';
import { CompanionFormField } from './CompanionFormField';
import { getAgreementCopy } from '../../../../../constants';

type BenefitDetailsSectionProps = {
  handleFieldChange: (
    field: keyof AgreementLocalizedFormState['companion'],
    value: string | number,
  ) => void;
};

export const BenefitDetailsSection = ({
  handleFieldChange,
}: BenefitDetailsSectionProps) => {
  const sameConditionAsOwner = useAppSelector(
    selectFieldActiveAgreementLanguageCompanionForm('isSameConditionAsOwner'),
  );
  const companionBenefitType = useAppSelector(
    selectFieldActiveAgreementLanguageCompanionForm('companionBenefitType'),
  );

  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);
  const companionCopy =
    getAgreementCopy(activeLanguage).additionalSections.companion;

  const benefitTypeOptions = Object.values(companionCopy.benefitTypeOptions);

  if (sameConditionAsOwner) {
    return <ViewSameConditions />;
  }

  return (
    <>
      <CompanionFormField
        name={'companionBenefitType'}
        onChange={(event) =>
          handleFieldChange('companionBenefitType', event.target.value)
        }
      >
        <AppSelect options={benefitTypeOptions} />
      </CompanionFormField>
      <FixedPriceFields />

      <CompanionFormField
        hide={companionBenefitType !== companionCopy.benefitTypeOptions.other}
        name={'companionOtherBenefitTypeDescription'}
        onChange={(event) =>
          handleFieldChange(
            'companionOtherBenefitTypeDescription',
            event.target.value,
          )
        }
      >
        <AppTextField fullWidth />
      </CompanionFormField>
    </>
  );
};
