import { AppSelect, AppTextField } from '../../../../../components';
import { useAppSelector } from '../../../../../hooks';
import { selectFieldActiveAgreementLanguageForm } from '../../../../../features/agreementDetailCreation/selectors';
import { BenefitDiscountValueType } from '../../../../../features/agreementDetailCreation/types';
import { FixedPriceFields } from './FixedPriceFields';
import { DetailFormField } from '../../AgreementDetailsSection/components/DetailFormField';
import { benefitTypeOptions } from '../../../../../constants';

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

  return (
    <>
      <DetailFormField name={'benefitType'}>
        <AppSelect options={benefitTypeOptions} value={benefitType} disabled />
      </DetailFormField>
      {benefitType === 'FIXED_PRICE' && (
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
        hide={benefitType !== 'OTHER'}
        name={'otherBenefitTypeDescription'}
      >
        <AppTextField fullWidth value={otherBenefitTypeDescription} disabled />
      </DetailFormField>
    </>
  );
};
