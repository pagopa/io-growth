import type { RootState } from '../../core/store';
import { benefitsApi } from './api';

const selectOpportunityCategoriesResult =
  benefitsApi.endpoints.getOpportunityCategories.select();

export const selectOpportunityCategories = (state: RootState) =>
  selectOpportunityCategoriesResult(state)?.data ?? [];
