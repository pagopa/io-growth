import { Paper, Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { setLocalizedField } from '../../../../features/agreementDetailCreation/agreementDetailCreationSlice';
import { AgreementLanguageTabs } from './components/AgreementLanguageTabs';
import { useCallback } from 'react';
import { AgreementDetailHeading } from './components/AgreementDetailHeading';

import { AppSelect, AppTextField } from '../../../../components';
import { getBenefitTypeOptions } from '../AgreementCompanionSection/utils/agreementForm';
import { FixedPriceBenefitFields } from './components/FixedPriceBenefitFields';
import {
  selectActiveAgreementLanguage,
  selectFieldActiveAgreementLanguageForm,
} from '../../../../features/agreementDetailCreation/selectors';
import { DetailFormField } from './components/DetailFormField';
import { AgreementDetailsFieldKey } from '../../../../features/agreementDetailCreation/types';
import { getAgreementDetailsFormCopy } from '../../../../constants';

export function AgreementDetailsSection() {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);
  const copy = getAgreementDetailsFormCopy(activeLanguage);

  const benefitType = useAppSelector(
    selectFieldActiveAgreementLanguageForm('benefitType'),
  );

  const handleFieldChange = useCallback(
    (field: AgreementDetailsFieldKey, value: string | number) => {
      dispatch(
        setLocalizedField({
          languageId: activeLanguage,
          field,
          value: String(value),
        }),
      );
    },
    [activeLanguage, dispatch],
  );

  const handleBenefitTypeChange = useCallback(
    (field: AgreementDetailsFieldKey, value: string | number) => {
      handleFieldChange(field, value);

      if (value !== copy.benefitTypeOptions.fixedPrice) {
        handleFieldChange('benefitDiscountValue', '');
        handleFieldChange('benefitDiscountValueType', '');
        handleFieldChange('otherBenefitTypeDescription', '');
      }
    },
    [copy, handleFieldChange],
  );

  return (
    <Paper elevation={0} sx={{ borderRadius: 2.5, p: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <AgreementDetailHeading
          sectionTitle={copy.sectionTitle}
          sectionDescription={copy.sectionDescription}
        />

        <AgreementLanguageTabs />

        <Stack spacing={2}>
          <DetailFormField
            name={'name'}
            onChange={(event) => handleFieldChange('name', event.target.value)}
          >
            <AppTextField fullWidth inputProps={{ maxLength: 50 }} required />
          </DetailFormField>

          <DetailFormField
            name={'benefitType'}
            onChange={(event) =>
              handleBenefitTypeChange('benefitType', event.target.value)
            }
          >
            <AppSelect options={getBenefitTypeOptions(copy)} />
          </DetailFormField>

          <FixedPriceBenefitFields />

          <DetailFormField
            hide={benefitType !== copy.benefitTypeOptions.other}
            name={'otherBenefitTypeDescription'}
            onChange={(event) =>
              handleFieldChange(
                'otherBenefitTypeDescription',
                event.target.value,
              )
            }
          >
            <AppTextField fullWidth />
          </DetailFormField>

          <DetailFormField
            name={'description'}
            onChange={(event) =>
              handleFieldChange('description', event.target.value)
            }
          >
            <AppTextField fullWidth inputProps={{ maxLength: 250 }} />
          </DetailFormField>

          <DetailFormField
            name={'category'}
            onChange={(event) =>
              handleFieldChange('category', event.target.value)
            }
          >
            <AppSelect options={copy.categoryOptions} />
          </DetailFormField>

          <DetailFormField
            name={'conditions'}
            onChange={(event) =>
              handleFieldChange('conditions', event.target.value)
            }
          >
            <AppTextField fullWidth inputProps={{ maxLength: 200 }} />
          </DetailFormField>
        </Stack>
      </Stack>
    </Paper>
  );
}
