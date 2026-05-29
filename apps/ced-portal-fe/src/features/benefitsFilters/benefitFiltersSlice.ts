import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BenefitFiltersState } from './types';

const initialState: BenefitFiltersState = {
  name: null,
  category: null,
  status: null,
};

const benefitFiltersSlice = createSlice({
  name: 'benefitFilters',
  initialState,
  reducers: {
    setBenefitNameFilter(
      state,
      action: PayloadAction<BenefitFiltersState['name']>,
    ) {
      state.name = action.payload;
    },
    setBenefitCategoryFilter(
      state,
      action: PayloadAction<BenefitFiltersState['category']>,
    ) {
      state.category = action.payload;
    },
    setBenefitStatusFilter(
      state,
      action: PayloadAction<BenefitFiltersState['status']>,
    ) {
      state.status = action.payload;
    },
    resetBenefitFilters() {
      return initialState;
    },
    setBenefitFilters(_, action: PayloadAction<BenefitFiltersState>) {
      return action.payload;
    },
  },
});

export const {
  setBenefitNameFilter,
  setBenefitCategoryFilter,
  setBenefitStatusFilter,
  resetBenefitFilters,
  setBenefitFilters,
} = benefitFiltersSlice.actions;

export const benefitFiltersReducer = benefitFiltersSlice.reducer;
