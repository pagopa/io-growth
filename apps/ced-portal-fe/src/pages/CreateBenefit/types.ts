import type { BenefitRequest } from '../../core/api/generated/model/benefitRequest';
import type { LocalizedMetadataItemLanguage } from '../../core/api/generated/model/localizedMetadataItemLanguage';
import type { OpportunityDetailResponse } from '../../core/api/generated/model/opportunityDetailResponse';
import type { AccessPoint } from '../../features/places/types';

export interface CreateBenefitNavigationState {
  sourceOpportunityId?: OpportunityDetailResponse['id'];
}

export type CreateBenefitLanguageId = LocalizedMetadataItemLanguage;

export interface LocalizedFormTexts {
  name: string;
  description: string;
  condition: string;
}

export interface OpportunityPrefillData {
  preselectedLocationIds: string[];
  preselectedWebsiteIds: string[];
  accessPoint: AccessPoint;
  hasEndDate: boolean;
  startDate: string;
  endDate: string;
  benefitUrl: string;
  categoryId: string;
  beneficiaryBenefit: BenefitRequest;
  caregiverBenefit: BenefitRequest | null;
  localizedByLanguage: Partial<
    Record<CreateBenefitLanguageId, LocalizedFormTexts>
  >;
}
