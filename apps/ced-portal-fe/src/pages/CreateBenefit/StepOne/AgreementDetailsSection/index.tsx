import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import { Divider, Paper, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import {
  setField,
  setLocalizedValue,
  setBenefit,
  OpportunityCreationForm,
} from '../../../../features/opportunityCreation/opportunityCreationSlice';
import {
  selectActiveFormLanguage,
  selectBeneficiaryBenefit,
} from '../../../../features/opportunityCreation/selectors';
import { AgreementLanguageTabs } from './components/AgreementLanguageTabs';
import { useCallback, useMemo } from 'react';
import { AgreementDetailHeading } from './components/AgreementDetailHeading';
import { AppSelect, AppTextField } from '../../../../components';
import { FixedPriceBenefitFields } from './components/FixedPriceBenefitFields';
import { DetailFormField } from './components/DetailFormField';
import { benefitTypeOptions, getAgreementCopy } from '../../../../constants';
import {
  BenefitDiscountDiscountType,
  BenefitOtherType,
  BenefitReducedFixedPriceType,
  BenefitRequest,
  OpportunityCreateRequest,
} from '../../../../core/api/generated/model';
import { FieldWithIcon } from './components/FieldWithIcon';
import { benefitTypeMap } from '../../../../constants/formOptions/types';
import { selectOpportunityCategories } from '../../../../features/benefits/selectors';

export function AgreementDetailsSection({
  attempted,
}: Readonly<{ attempted: boolean }>) {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveFormLanguage);
  const copy = getAgreementCopy(activeLanguage);

  const benefitType = useAppSelector(selectBeneficiaryBenefit);

  const categories = useAppSelector(selectOpportunityCategories);

  const categoriesOptions = useMemo(
    () =>
      categories.map(({ id, title }) => ({
        value: id,
        label: title,
      })),
    [categories],
  );

  const handleLocalizedFieldChange = useCallback(
    (
      field: OpportunityCreateRequest['localizedMetadata'][number]['key'],
      value: string | number,
    ) => {
      dispatch(
        setLocalizedValue({
          language: activeLanguage,
          key: field,
          value: String(value),
        }),
      );
    },
    [dispatch, activeLanguage],
  );

  const handleFieldChange = useCallback(
    (
      field: keyof OpportunityCreationForm,
      value: OpportunityCreationForm[keyof OpportunityCreationForm],
    ) => {
      dispatch(setField({ field, value }));
    },
    [dispatch],
  );

  const handleBenefitTypeChange = useCallback(
    (type: BenefitRequest['type']) => {
      switch (type) {
        case 'discount':
          dispatch(
            setBenefit({
              which: 'beneficiaryBenefit',
              value: {
                type,
                discountType: BenefitDiscountDiscountType.percentage,
                value: 0,
              },
            }),
          );
          break;
        case 'reduced_fixed_price':
          dispatch(
            setBenefit({
              which: 'beneficiaryBenefit',
              value: {
                type,
                value: 0,
              },
            }),
          );
          break;
        case 'other':
          dispatch(
            setBenefit({
              which: 'beneficiaryBenefit',
              value: {
                type,
                description: '',
              },
            }),
          );
          break;
        default:
          dispatch(
            setBenefit({
              which: 'beneficiaryBenefit',
              value: { type },
            }),
          );
      }
    },
    [dispatch],
  );

  return (
    <Paper elevation={0} sx={{ borderRadius: 2.5, p: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <AgreementDetailHeading
          sectionTitle={copy.detailsForm.sectionTitle}
          sectionDescription={copy.detailsForm.sectionDescription}
        />

        <AgreementLanguageTabs />

        <Stack spacing={2}>
          <DetailFormField
            name={'name'}
            path={`localizedMetadata.${activeLanguage}.name`}
            required
            attempted={attempted}
            onChange={(event) =>
              handleLocalizedFieldChange('name', event.target.value)
            }
          >
            <AppTextField fullWidth inputProps={{ maxLength: 50 }} />
          </DetailFormField>

          <DetailFormField
            name={'benefitType'}
            path={'beneficiaryBenefit.type'}
            required
            attempted={attempted}
            onChange={(event) =>
              handleBenefitTypeChange(
                event.target.value as BenefitRequest['type'],
              )
            }
          >
            <AppSelect options={benefitTypeOptions} />
          </DetailFormField>

          <FixedPriceBenefitFields />

          <DetailFormField
            hide={
              benefitTypeMap[benefitType?.type] !==
              benefitTypeMap['reduced_fixed_price']
            }
            name={'fixedPrice'}
            path={'beneficiaryBenefit.value'}
            onChange={(event) =>
              handleFieldChange('beneficiaryBenefit', {
                type: BenefitReducedFixedPriceType.reduced_fixed_price,
                value: Number(event.target.value),
              })
            }
          >
            <FieldWithIcon
              onChange={(event) =>
                handleFieldChange('beneficiaryBenefit', {
                  type: BenefitReducedFixedPriceType.reduced_fixed_price,
                  value: Number(event.target.value),
                })
              }
              icon={<EuroRoundedIcon sx={{ fontSize: 18 }} />}
              label={copy.detailsForm.fixedPriceLabel}
            />
          </DetailFormField>

          <DetailFormField
            hide={benefitTypeMap[benefitType?.type] !== benefitTypeMap['other']}
            name={'otherBenefitTypeDescription'}
            path={'beneficiaryBenefit.description'}
            onChange={(event) =>
              handleFieldChange('beneficiaryBenefit', {
                type: BenefitOtherType.other,
                description: event.target.value,
              })
            }
          >
            <AppTextField fullWidth />
          </DetailFormField>

          <DetailFormField
            name={'description'}
            path={`localizedMetadata.${activeLanguage}.description`}
            required
            attempted={attempted}
            onChange={(event) =>
              handleLocalizedFieldChange('description', event.target.value)
            }
          >
            <AppTextField fullWidth inputProps={{ maxLength: 250 }} />
          </DetailFormField>

          <DetailFormField
            name={'category'}
            path={'categoryId'}
            required
            attempted={attempted}
            onChange={(event) =>
              handleFieldChange('categoryId', event.target.value)
            }
          >
            <AppSelect
              options={categoriesOptions}
              renderCustomOptions={({ label, lastElement, index }) => (
                <Stack
                  direction="column"
                  spacing={0.5}
                  alignItems="flex-start"
                  width={'100%'}
                >
                  <Typography variant="body1" component="span">
                    {label}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="span"
                  >
                    {categories[index].description}
                  </Typography>
                  {!lastElement && <Divider sx={{ width: '100%' }} />}
                </Stack>
              )}
            />
          </DetailFormField>

          <DetailFormField
            name={'conditions'}
            path={`localizedMetadata.${activeLanguage}.condition`}
            onChange={(event) =>
              handleLocalizedFieldChange('condition', event.target.value)
            }
          >
            <AppTextField fullWidth inputProps={{ maxLength: 200 }} />
          </DetailFormField>
        </Stack>
      </Stack>
    </Paper>
  );
}
