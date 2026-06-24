import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  OpportunityCreateRequest,
  BenefitRequest,
  LocalizedMetadataItem,
  LocalizedMetadataItemLanguage,
  LocalizedMetadataItemKey,
} from '../../core/api/generated/model';

// A simplified form state that avoids deep nesting while keeping small objects
export type OpportunityCreationForm = Omit<
  OpportunityCreateRequest,
  'localizedMetadata'
> & {
  localizedMetadata: Record<
    LocalizedMetadataItemLanguage,
    Record<LocalizedMetadataItemKey, string>
  >;
};

export interface OpportunityCreationState {
  form: OpportunityCreationForm;
  activeLanguage: LocalizedMetadataItemLanguage;
  caregiverEnabled?: boolean;
  caregiverHasSameConditions?: boolean;
  hasEndDate?: boolean;
}

const createEmptyForm = (): OpportunityCreationForm => ({
  dateFrom: '',
  dateTo: undefined,
  url: undefined,
  categoryId: '',
  placeIds: [],
  beneficiaryBenefit: {} as BenefitRequest,
  caregiverBenefit: undefined,
  nationalTerritory: undefined,
  localizedMetadata: {
    de: {},
    en: {},
    it: {},
    fr: {},
    sl: {},
  } as Record<LocalizedMetadataItemLanguage, Record<string, any>>,
});

const initialState: OpportunityCreationState = {
  activeLanguage: 'it',
  form: createEmptyForm(),
};

const opportunityCreationSlice = createSlice({
  name: 'opportunityCreation',
  initialState,
  reducers: {
    setActiveLanguage: (
      state,
      action: PayloadAction<LocalizedMetadataItemLanguage>,
    ) => {
      state.activeLanguage = action.payload;
    },
    setCaregiverEnabled: (state, action: PayloadAction<boolean>) => {
      state.caregiverEnabled = action.payload;
    },
    setCaregiverHasSameConditions: (state, action: PayloadAction<boolean>) => {
      state.caregiverHasSameConditions = action.payload;
    },
    setHasEndDate: (state, action: PayloadAction<boolean>) => {
      state.hasEndDate = action.payload;
    },
    cloneOwnerBenefitToCompanion: (state) => {
      state.form.caregiverBenefit = {
        ...state.form.beneficiaryBenefit,
      } as BenefitRequest;
    },
    setField: (
      state,
      action: PayloadAction<{
        field: keyof OpportunityCreationForm;
        value: OpportunityCreationForm[keyof OpportunityCreationForm];
      }>,
    ) => {
      const { field, value } = action.payload;
      state.form = { ...state.form, [field]: value };
    },

    setPlaceIds: (state, action: PayloadAction<string[]>) => {
      state.form.placeIds = action.payload;
    },

    addPlaceId: (state, action: PayloadAction<string>) => {
      if (!state.form.placeIds) {
        state.form.placeIds = [];
      }
      if (!state.form.placeIds.includes(action.payload)) {
        state.form.placeIds.push(action.payload);
      }
    },

    removePlaceId: (state, action: PayloadAction<string>) => {
      state.form.placeIds = (state.form.placeIds ?? []).filter(
        (p) => p !== action.payload,
      );
    },

    setBenefit: (
      state,
      action: PayloadAction<{
        which: 'beneficiaryBenefit' | 'caregiverBenefit';
        value: BenefitRequest;
      }>,
    ) => {
      const { which, value } = action.payload;
      state.form[which] = value;
    },

    setLocalizedValue: (
      state,
      action: PayloadAction<LocalizedMetadataItem>,
    ) => {
      const { language, key, value } = action.payload;

      state.form.localizedMetadata[language][key] = value;
    },
    removeLocalizedValue: (
      state,
      action: PayloadAction<{
        language: LocalizedMetadataItemLanguage;
        key: 'name' | 'description' | 'condition';
      }>,
    ) => {
      const { language, key } = action.payload;
      if (state.form.localizedMetadata[language][key]) {
        delete state.form.localizedMetadata[language][key];
      }
    },

    // Replace whole form (useful when editing an existing Opportunity)
    setForm: (
      state,
      action: PayloadAction<Partial<OpportunityCreateRequest>>,
    ) => {
      const incoming = action.payload;
      state.form = {
        ...createEmptyForm(),
        ...(incoming as any),
      };
    },

    resetForm: () => ({
      form: createEmptyForm(),
      activeLanguage: LocalizedMetadataItemLanguage.it,
    }),
  },
});

export const {
  setActiveLanguage,
  setCaregiverEnabled,
  setCaregiverHasSameConditions,
  setHasEndDate,
  cloneOwnerBenefitToCompanion,
  setField,
  setPlaceIds,
  addPlaceId,
  removePlaceId,
  setBenefit,
  setLocalizedValue,
  removeLocalizedValue,
  setForm,
  resetForm,
} = opportunityCreationSlice.actions;

export const opportunityCreationReducer = opportunityCreationSlice.reducer;
