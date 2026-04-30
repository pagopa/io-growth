import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  AGREEMENT_LANGUAGE_TABS,
  DEFAULT_AGREEMENT_LANGUAGE,
} from '../../pages/CreateBenefit/StepOne/AgreementCompanionSection/utils/agreementLanguageTabs.config';

import {
  AgreementDetailsFieldKey,
  AgreementLocalizedFormState,
  BenefitDiscountValueType,
} from './types';
import { createEmptyLanguageFormState } from './constants';

type AgreementLocalizedForm = Record<string, AgreementLocalizedFormState>;

const createInitialLocalizedForm = (): AgreementLocalizedForm =>
  AGREEMENT_LANGUAGE_TABS.reduce<AgreementLocalizedForm>((acc, language) => {
    acc[language.id] = createEmptyLanguageFormState();
    return acc;
  }, {});

export interface AgreementDetailCreationState {
  activeLanguage: string;
  localizedForm: AgreementLocalizedForm;
}

const createInitialState = (): AgreementDetailCreationState => ({
  activeLanguage: DEFAULT_AGREEMENT_LANGUAGE,
  localizedForm: createInitialLocalizedForm(),
});

const initialState: AgreementDetailCreationState = createInitialState();

const getLanguageFormState = (
  state: AgreementDetailCreationState,
  languageId: string,
) => {
  if (!state.localizedForm[languageId]) {
    state.localizedForm[languageId] = createEmptyLanguageFormState();
  }
  return state.localizedForm[languageId];
};

const resetCompanionData = (languageFormState: AgreementLocalizedFormState) => {
  languageFormState.companion.companionBenefitType = '';
  languageFormState.companion.companionDiscountValueType = 'FIXED';
  languageFormState.companion.companionDiscountValue = '';
  languageFormState.companion.companionOtherBenefitTypeDescription = '';
};

export const agreementDetailCreationSlice = createSlice({
  name: 'agreementDetailCreation',
  initialState,
  reducers: {
    setActiveLanguage: (state, action: PayloadAction<string>) => {
      state.activeLanguage = action.payload;
      getLanguageFormState(state, action.payload);
    },
    setLocalizedField: (
      state,
      action: PayloadAction<{
        languageId: string;
        field: AgreementDetailsFieldKey;
        value: string;
      }>,
    ) => {
      const { languageId, field, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);
      if (field === 'benefitDiscountValueType') {
        languageFormState.details.benefitDiscountValueType =
          value === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED';
        return;
      }

      languageFormState.details[field] = value;
    },
    setLocalizedCompanionField: (
      state: AgreementDetailCreationState,
      action: PayloadAction<{
        languageId: string;
        field: keyof AgreementLocalizedFormState['companion'];
        value: string | boolean;
      }>,
    ) => {
      const { languageId, field, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);
      languageFormState.companion = {
        ...languageFormState.companion,
        [field]: value,
      };
    },
    setCompanionBenefitEnabled: (
      state,
      action: PayloadAction<{ languageId: string; value: boolean }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);

      languageFormState.companion.isCompanionBenefit = value;
      if (!value) {
        languageFormState.companion.isSameConditionAsOwner = false;
        resetCompanionData(languageFormState);
      }
    },
    setSameConditionAsOwner: (
      state,
      action: PayloadAction<{ languageId: string; value: boolean }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);

      languageFormState.companion.isSameConditionAsOwner = value;
      if (value) {
        resetCompanionData(languageFormState);
      }
    },
    setCompanionBenefitType: (
      state,
      action: PayloadAction<{ languageId: string; value: string }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);
      languageFormState.companion.companionBenefitType = value;
    },
    setCompanionDiscountValueType: (
      state,
      action: PayloadAction<{
        languageId: string;
        value: BenefitDiscountValueType;
      }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);
      languageFormState.companion.companionDiscountValueType = value;
    },
    setCompanionDiscountValue: (
      state,
      action: PayloadAction<{ languageId: string; value: string }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);
      languageFormState.companion.companionDiscountValue = value;
    },
    setCompanionOtherBenefitTypeDescription: (
      state,
      action: PayloadAction<{ languageId: string; value: string }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);
      languageFormState.companion.companionOtherBenefitTypeDescription = value;
    },
    setHasEndDate: (
      state,
      action: PayloadAction<{ languageId: string; value: boolean }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);
      languageFormState.hasEndDate = value;
    },
    setStartDate: (
      state,
      action: PayloadAction<{ languageId: string; value: string }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);
      languageFormState.startDate = value;
    },
    setEndDate: (
      state,
      action: PayloadAction<{ languageId: string; value: string }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);
      languageFormState.endDate = value;
    },
    setBenefitUrl: (
      state,
      action: PayloadAction<{ languageId: string; value: string }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);
      languageFormState.benefitUrl = value;
    },
    resetAgreementDetailCreationForm: () => createInitialState(),
  },
});

export const {
  setActiveLanguage,
  setLocalizedField,
  setLocalizedCompanionField,
  setCompanionBenefitEnabled,
  setSameConditionAsOwner,
  setCompanionBenefitType,
  setCompanionDiscountValueType,
  setCompanionDiscountValue,
  setCompanionOtherBenefitTypeDescription,
  setHasEndDate,
  setStartDate,
  setEndDate,
  setBenefitUrl,
  resetAgreementDetailCreationForm,
} = agreementDetailCreationSlice.actions;

export const agreementDetailCreationReducer =
  agreementDetailCreationSlice.reducer;
