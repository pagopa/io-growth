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
  selectedSedeIds: [],
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
    setSelectedSedeIds(state, action: PayloadAction<string[]>) {
      state.selectedSedeIds = action.payload;
    },
    removeSelectedSedeId(state, action: PayloadAction<string>) {
      state.selectedSedeIds = state.selectedSedeIds.filter(
        (id) => id !== action.payload,
      );
    },
  },
});

export const {
  setAccessPoint,
  setNationwide,
  setSelectedSedeIds,
  removeSelectedSedeId,
} = wizardSlice.actions;

export const wizardReducer = wizardSlice.reducer;

export const selectAccessPoint = (state: RootState) => state.wizard.accessPoint;
export const selectNationwide = (state: RootState) => state.wizard.nationwide;
export const selectSelectedSedeIds = (state: RootState) => state.wizard.selectedSedeIds;
