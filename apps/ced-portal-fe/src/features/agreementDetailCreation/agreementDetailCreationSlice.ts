import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  AGREEMENT_LANGUAGE_TABS,
  DEFAULT_AGREEMENT_LANGUAGE,
} from '../../pages/AgreementDetailCreation/components/agreementLanguageTabs.config';
import type {
  AgreementDetailsFieldKey,
  AgreementDetailsFields,
  BenefitDiscountValueType,
} from '../../pages/AgreementDetailCreation/components/types';
import type { RootState } from '../../core/store';

const EMPTY_DETAILS: AgreementDetailsFields = {
  name: '',
  benefitType: '',
  benefitDiscountValueType: 'fixed',
  benefitDiscountValue: '',
  otherBenefitTypeDescription: '',
  description: '',
  category: '',
  conditions: '',
};

interface AgreementLocalizedFormState {
  details: AgreementDetailsFields;
  isCompanionBenefit: boolean;
  isSameConditionAsOwner: boolean;
  companionBenefitType: string;
  companionDiscountValueType: BenefitDiscountValueType;
  companionDiscountValue: string;
  companionOtherBenefitTypeDescription: string;
  hasEndDate: boolean;
  startDate: string;
  endDate: string;
  benefitUrl: string;
}

type AgreementLocalizedForm = Record<string, AgreementLocalizedFormState>;

const createEmptyLanguageFormState = (): AgreementLocalizedFormState => ({
  details: { ...EMPTY_DETAILS },
  isCompanionBenefit: false,
  isSameConditionAsOwner: false,
  companionBenefitType: '',
  companionDiscountValueType: 'fixed',
  companionDiscountValue: '',
  companionOtherBenefitTypeDescription: '',
  hasEndDate: false,
  startDate: '',
  endDate: '',
  benefitUrl: '',
});

const EMPTY_LANGUAGE_FORM_STATE: AgreementLocalizedFormState =
  createEmptyLanguageFormState();

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
  languageFormState.companionBenefitType = '';
  languageFormState.companionDiscountValueType = 'fixed';
  languageFormState.companionDiscountValue = '';
  languageFormState.companionOtherBenefitTypeDescription = '';
};

export const agreementDetailCreationSlice = createSlice({
  name: 'agreementDetailCreation',
  initialState,
  reducers: {
    setActiveLanguage: (state, action: PayloadAction<string>) => {
      state.activeLanguage = action.payload;
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
          value === 'percentage' ? 'percentage' : 'fixed';
        return;
      }

      languageFormState.details[field] = value;
    },
    setCompanionBenefitEnabled: (
      state,
      action: PayloadAction<{ languageId: string; value: boolean }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);

      languageFormState.isCompanionBenefit = value;
      if (!value) {
        languageFormState.isSameConditionAsOwner = false;
        resetCompanionData(languageFormState);
      }
    },
    setSameConditionAsOwner: (
      state,
      action: PayloadAction<{ languageId: string; value: boolean }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);

      languageFormState.isSameConditionAsOwner = value;
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
      languageFormState.companionBenefitType = value;
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
      languageFormState.companionDiscountValueType = value;
    },
    setCompanionDiscountValue: (
      state,
      action: PayloadAction<{ languageId: string; value: string }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);
      languageFormState.companionDiscountValue = value;
    },
    setCompanionOtherBenefitTypeDescription: (
      state,
      action: PayloadAction<{ languageId: string; value: string }>,
    ) => {
      const { languageId, value } = action.payload;
      const languageFormState = getLanguageFormState(state, languageId);
      languageFormState.companionOtherBenefitTypeDescription = value;
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

export const selectAgreementDetailCreationState = (state: RootState) =>
  state.agreementDetailCreation;

export const selectActiveAgreementLanguage = (state: RootState) =>
  state.agreementDetailCreation.activeLanguage;

export const selectActiveAgreementLanguageForm = (state: RootState) => {
  const agreementState = state.agreementDetailCreation;
  return (
    agreementState.localizedForm[agreementState.activeLanguage] ??
    EMPTY_LANGUAGE_FORM_STATE
  );
};
