import {
  LocalizedMetadataItemKey,
  type OpportunityDetailResponse,
} from '../../../core/api/generated/model';
import { BenefitCategory } from '../../../features/benefitsFilters/types';
import type { AccessPoint } from '../../../features/wizard/types';
import type {
  BenefitFormValues,
  CreateBenefitLanguageId,
  OpportunityPrefillData,
} from '../types';

const BENEFIT_TYPE_VALUES = {
  discount: 'DISCOUNT',
  free: 'FREE',
  reduced_fixed_price: 'FIXED_PRICE',
  priority: 'PRIORITY',
  other: 'OTHER',
} as const;

const toDateInputValue = (value?: string | null) => value?.split('T')[0] ?? '';

const getCategoryKeyByTitle = (
  categoryTitle: string,
): keyof typeof BenefitCategory | '' => {
  const category = Object.entries(BenefitCategory).find(
    ([, title]) => title === categoryTitle,
  );

  return (category?.[0] as keyof typeof BenefitCategory | undefined) ?? '';
};

const mapBenefitToFormValues = (
  benefit: OpportunityDetailResponse['beneficiaryBenefit'],
): BenefitFormValues => {
  switch (benefit.type) {
    case 'discount':
      return {
        benefitType: BENEFIT_TYPE_VALUES.discount,
        benefitDiscountValueType:
          benefit.discountType === 'percentage' ? 'PERCENTAGE' : 'FIXED',
        benefitDiscountValue: String(benefit.value),
        otherBenefitTypeDescription: '',
      };
    case 'reduced_fixed_price':
      return {
        benefitType: BENEFIT_TYPE_VALUES.reduced_fixed_price,
        benefitDiscountValueType: 'FIXED',
        benefitDiscountValue: String(benefit.value),
        otherBenefitTypeDescription: '',
      };
    case 'other':
      return {
        benefitType: BENEFIT_TYPE_VALUES.other,
        benefitDiscountValueType: 'FIXED',
        benefitDiscountValue: '',
        otherBenefitTypeDescription: benefit.description,
      };
    case 'priority':
      return {
        benefitType: BENEFIT_TYPE_VALUES.priority,
        benefitDiscountValueType: 'FIXED',
        benefitDiscountValue: '',
        otherBenefitTypeDescription: '',
      };
    case 'free':
    default:
      return {
        benefitType: BENEFIT_TYPE_VALUES.free,
        benefitDiscountValueType: 'FIXED',
        benefitDiscountValue: '',
        otherBenefitTypeDescription: '',
      };
  }
};

const getAccessPoint = (
  selectedLocationIds: string[],
  selectedWebsiteIds: string[],
  hasPlaces: boolean,
): AccessPoint => {
  if (selectedLocationIds.length > 0 && selectedWebsiteIds.length > 0) {
    return 'both';
  }

  if (selectedWebsiteIds.length > 0) {
    return 'online';
  }

  if (selectedLocationIds.length > 0 || hasPlaces) {
    return 'territory';
  }

  return '';
};

const getLocalizedValue = (
  detail: OpportunityDetailResponse,
  key: keyof typeof LocalizedMetadataItemKey,
  languageId: CreateBenefitLanguageId,
) =>
  detail.localizedMetadata.find(
    (item) =>
      item.key === LocalizedMetadataItemKey[key] &&
      item.language === languageId,
  )?.value ?? '';

const toIdSet = (ids: string[]) => new Set(ids);

export const buildOpportunityPrefillData = (
  detail: OpportunityDetailResponse,
  availableLocationIds: string[],
  availableWebsiteIds: string[],
): OpportunityPrefillData => {
  const locationIdSet = toIdSet(availableLocationIds);
  const websiteIdSet = toIdSet(availableWebsiteIds);

  const preselectedLocationIds = detail.placeIds.filter((id) =>
    locationIdSet.has(id),
  );
  const preselectedWebsiteIds = detail.placeIds.filter((id) =>
    websiteIdSet.has(id),
  );

  const localizedByLanguage = detail.localizedMetadata.reduce<
    OpportunityPrefillData['localizedByLanguage']
  >((acc, item) => {
    const languageId = item.language;
    acc[languageId] = {
      name: getLocalizedValue(detail, 'name', languageId),
      description: getLocalizedValue(detail, 'description', languageId),
      conditions: getLocalizedValue(detail, 'condition', languageId),
    };

    return acc;
  }, {});

  return {
    preselectedLocationIds,
    preselectedWebsiteIds,
    accessPoint: getAccessPoint(
      preselectedLocationIds,
      preselectedWebsiteIds,
      detail.placeIds.length > 0,
    ),
    hasEndDate: Boolean(detail.dateTo),
    startDate: toDateInputValue(detail.dateFrom),
    endDate: toDateInputValue(detail.dateTo),
    benefitUrl: detail.url ?? '',
    category: getCategoryKeyByTitle(detail.categoryTitle),
    beneficiaryValues: mapBenefitToFormValues(detail.beneficiaryBenefit),
    caregiverValues: detail.caregiverBenefit
      ? mapBenefitToFormValues(detail.caregiverBenefit)
      : null,
    localizedByLanguage,
  };
};
