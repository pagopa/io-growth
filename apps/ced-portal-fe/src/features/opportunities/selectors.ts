import { RootState } from '../../core/store';
import { opportunitiesApi } from './api';

const selectOpportunityCategoriesResult =
  opportunitiesApi.endpoints.getOpportunityCategories.select();

export const selectOpportunityCategories = (state: RootState) =>
  selectOpportunityCategoriesResult(state)?.data ?? [];
