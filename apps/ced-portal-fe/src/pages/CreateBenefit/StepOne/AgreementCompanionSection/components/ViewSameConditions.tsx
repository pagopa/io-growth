import { AppSelect, AppTextField } from '../../../../../components';
import { useAppSelector } from '../../../../../hooks';
import { DiscountFields } from './DiscountFields';
import { DetailFormField } from '../../AgreementDetailsSection/components/DetailFormField';
import { getLocalizedOptions } from '../../../../../constants';
import {
  selectActiveFormLanguage,
  selectBeneficiaryBenefit,
} from '../../../../../features/opportunityCreation/selectors';
import { useMemo } from 'react';

export const ViewSameConditions = () => {
  const benefit = useAppSelector(selectBeneficiaryBenefit);
  const activeLanguage = useAppSelector(selectActiveFormLanguage);

  const benefitTypeOptions = useMemo(
    () => getLocalizedOptions(activeLanguage, 'benefit'),
    [activeLanguage],
  );

  if (!benefit) {
    return null;
  }

  const { type } = benefit;
  return (
    <>
      <DetailFormField
        name={'benefitType'}
        path={'beneficiaryBenefit.type'}
        disabled
      >
        <AppSelect options={benefitTypeOptions} />
      </DetailFormField>
      {type === 'discount' && <DiscountFields sameValues benefit={benefit} />}

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
