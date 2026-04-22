import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  AccessPoint,
  Language,
  TranslatedFields,
  WizardFormState,
} from './types';
import { LANGUAGES } from './types';
import type { RootState } from '../../core/store';

const emptyTranslation: TranslatedFields = {
  name: '',
  description: '',
  conditions: '',
};

const initialState: WizardFormState = {
  translations: Object.fromEntries(
    LANGUAGES.map((l) => [l, { ...emptyTranslation }]),
  ) as Record<Language, TranslatedFields>,
  benefitType: '',
  discountType: 'percentage',
  discountPercentage: '',
  category: '',
  startDate: '',
  endDate: '',
  endDateEnabled: false,
  companionEnabled: false,
  link: '',
  accessPoint: '',
  nationwide: false,
  selectedLocationIds: [],
  selectedWebsiteIds: [],
};

const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    setAccessPoint(state, action: PayloadAction<AccessPoint>) {
      state.accessPoint = action.payload;
    },
    setNationwide(state, action: PayloadAction<boolean>) {
      state.nationwide = action.payload;
    },
    setSelectedLocationIds(state, action: PayloadAction<string[]>) {
      state.selectedLocationIds = action.payload;
    },
    removeSelectedLocationId(state, action: PayloadAction<string>) {
      state.selectedLocationIds = state.selectedLocationIds.filter(
        (id) => id !== action.payload,
      );
    },
    setSelectedWebsiteIds(state, action: PayloadAction<string[]>) {
      state.selectedWebsiteIds = action.payload;
    },
    removeSelectedWebsiteId(state, action: PayloadAction<string>) {
      state.selectedWebsiteIds = state.selectedWebsiteIds.filter(
        (id) => id !== action.payload,
      );
    },
  },
});

export const {
  setAccessPoint,
  setNationwide,
  setSelectedLocationIds,
  removeSelectedLocationId,
  setSelectedWebsiteIds,
  removeSelectedWebsiteId,
} = wizardSlice.actions;

export const wizardReducer = wizardSlice.reducer;

export const selectAccessPoint = (state: RootState) => state.wizard.accessPoint;
export const selectNationwide = (state: RootState) => state.wizard.nationwide;
export const selectSelectedLocationIds = (state: RootState) =>
  state.wizard.selectedLocationIds;
export const selectSelectedWebsiteIds = (state: RootState) =>
  state.wizard.selectedWebsiteIds;
