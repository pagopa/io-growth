import { AppSelect, AppTextField } from '../../../../../components';
import { useAppSelector } from '../../../../../hooks';
import {
  selectActiveAgreementLanguage,
  selectFieldActiveAgreementLanguageForm,
} from '../../../../../features/agreementDetailCreation/selectors';
import { BenefitDiscountValueType } from '../../../../../features/agreementDetailCreation/types';
import { getBenefitTypeOptions } from '../utils/agreementForm';
import { FixedPriceFields } from './FixedPriceFields';
import { DetailFormField } from '../../AgreementDetailsSection/components/DetailFormField';
import { getAgreementDetailsFormCopy } from '../../../../../constants';

export const ViewSameConditions = () => {
  const benefitType = useAppSelector(
    selectFieldActiveAgreementLanguageForm('benefitType'),
  );
  const benefitDiscountValue = useAppSelector(
    selectFieldActiveAgreementLanguageForm('benefitDiscountValue'),
  );
  const benefitDiscountValueType = useAppSelector(
    selectFieldActiveAgreementLanguageForm('benefitDiscountValueType'),
  );
  const otherBenefitTypeDescription = useAppSelector(
    selectFieldActiveAgreementLanguageForm('otherBenefitTypeDescription'),
  );

  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);
  const companionCopy = getAgreementDetailsFormCopy(activeLanguage);
  return (
    <>
      <DetailFormField name={'benefitType'}>
        <AppSelect
          options={getBenefitTypeOptions(companionCopy)}
          value={benefitType}
          disabled
        />
      </DetailFormField>
      {benefitType === companionCopy.benefitTypeOptions.fixedPrice && (
        <FixedPriceFields
          sameValues
          values={{
            discountValueType:
              benefitDiscountValueType as BenefitDiscountValueType,
            discountValue: benefitDiscountValue,
          }}
        />
      )}

      <DetailFormField
        hide={benefitType !== companionCopy.benefitTypeOptions.other}
        name={'otherBenefitTypeDescription'}
      >
        <AppTextField fullWidth value={otherBenefitTypeDescription} disabled />
      </DetailFormField>
    </>
  );
};
