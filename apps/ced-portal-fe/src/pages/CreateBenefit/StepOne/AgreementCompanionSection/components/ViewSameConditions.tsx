import { AppSelect, AppTextField } from '../../../../../components';
import { useAppSelector } from '../../../../../hooks';
import { FixedPriceFields } from './FixedPriceFields';
import { DetailFormField } from '../../AgreementDetailsSection/components/DetailFormField';
import { benefitTypeOptions } from '../../../../../constants';
import { selectBeneficiaryBenefit } from '../../../../../features/opportunityCreation/selectors';

export const ViewSameConditions = () => {
  const benefit = useAppSelector(selectBeneficiaryBenefit);

  if (!benefit) {
    return null;
  }

  const { type } = benefit;
  return (
    <>
      <DetailFormField name={'benefitType'} path={'beneficiaryBenefit.type'}>
        <AppSelect options={benefitTypeOptions} disabled />
      </DetailFormField>
      {type === 'discount' && <FixedPriceFields sameValues benefit={benefit} />}

      <DetailFormField
        hide={type !== 'other'}
        name={'otherBenefitTypeDescription'}
        path={'beneficiaryBenefit.description'}
      >
        <AppTextField fullWidth disabled />
      </DetailFormField>
    </>
  );
};
