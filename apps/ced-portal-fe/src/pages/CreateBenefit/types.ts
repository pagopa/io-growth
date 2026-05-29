import type { LocalizedMetadataItemLanguage } from '../../core/api/generated/model/localizedMetadataItemLanguage';
import type { OpportunityDetailResponse } from '../../core/api/generated/model/opportunityDetailResponse';
import type { BenefitDiscountValueType } from '../../features/agreementDetailCreation/types';
import type { BenefitCategory } from '../../features/benefitsFilters/types';
import type { AccessPoint } from '../../features/wizard/types';

export interface CreateBenefitNavigationState {
  sourceOpportunityId?: OpportunityDetailResponse['id'];
}

export type CreateBenefitLanguageId = LocalizedMetadataItemLanguage;

export interface BenefitFormValues {
  benefitType: string;
  benefitDiscountValueType: BenefitDiscountValueType;
  benefitDiscountValue: string;
  otherBenefitTypeDescription: string;
}

export interface LocalizedFormTexts {
  name: string;
  description: string;
  conditions: string;
}

export interface OpportunityPrefillData {
  preselectedLocationIds: string[];
  preselectedWebsiteIds: string[];
  accessPoint: AccessPoint;
  hasEndDate: boolean;
  startDate: string;
  endDate: string;
  benefitUrl: string;
  category: keyof typeof BenefitCategory | '';
  beneficiaryValues: BenefitFormValues;
  caregiverValues: BenefitFormValues | null;
  localizedByLanguage: Partial<
    Record<CreateBenefitLanguageId, LocalizedFormTexts>
  >;
}
