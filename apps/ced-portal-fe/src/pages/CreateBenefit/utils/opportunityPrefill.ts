import {
  LocalizedMetadataItemKey,
  OpportunityDetailResponse,
} from '../../../core/api/generated/model';
import type { AccessPoint } from '../../../features/wizard/types';
import type { CreateBenefitLanguageId, OpportunityPrefillData } from '../types';

const toDateInputValue = (value?: string | null) => value?.split('T')[0] ?? '';

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
      condition: getLocalizedValue(detail, 'condition', languageId),
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
    categoryId: detail.categoryId,
    beneficiaryBenefit: detail.beneficiaryBenefit,
    caregiverBenefit: detail.caregiverBenefit ?? null,
    localizedByLanguage,
  };
};
