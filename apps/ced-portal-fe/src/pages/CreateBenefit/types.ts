import type { OpportunityDetailResponse } from '../../generated/model/opportunityDetailResponse';

export interface CreateBenefitNavigationState {
  sourceOpportunityId?: OpportunityDetailResponse['id'];
}
