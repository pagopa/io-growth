import type { RootState } from '../../core/store';

export const selectBenefitFilters = (state: RootState) => state.benefitFilters;

export const selectBenefitNameFilter = (state: RootState) =>
  state.benefitFilters.name;

export const selectBenefitCategoryFilter = (state: RootState) =>
  state.benefitFilters.category;

export const selectBenefitStatusFilter = (state: RootState) =>
  state.benefitFilters.status;
