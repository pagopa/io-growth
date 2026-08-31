import type { OpportunityDetailResponse } from '../../core/api/generated/model/opportunityDetailResponse';

export interface CreateBenefitNavigationState {
  sourceOpportunityId?: OpportunityDetailResponse['id'];
}
