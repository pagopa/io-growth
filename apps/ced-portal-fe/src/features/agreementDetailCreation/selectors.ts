import { RootState } from '../../core/store';
import { createEmptyLanguageFormState, EMPTY_DETAILS } from './constants';
import type {
  AgreementCompanionFields,
  AgreementDetailsFieldKey,
} from './types';

export const selectAgreementDetailCreationState = (state: RootState) =>
  state.agreementDetailCreation;

export const selectActiveAgreementLanguage = (state: RootState) =>
  state.agreementDetailCreation.activeLanguage;

export const selectActiveAgreementLanguageForm = (state: RootState) => {
  const agreementState = state.agreementDetailCreation;
  return (
    agreementState.localizedForm[agreementState.activeLanguage] ??
    createEmptyLanguageFormState()
  );
};

export const selectFieldActiveAgreementLanguageForm =
  (field: AgreementDetailsFieldKey) => (state: RootState) => {
    const agreementState = state.agreementDetailCreation;
    return (
      agreementState.localizedForm[agreementState.activeLanguage]?.details[
        field
      ] ?? EMPTY_DETAILS[field]
    );
  };

export const selectFieldActiveAgreementLanguageCompanionForm =
  <K extends keyof AgreementCompanionFields>(field: K) =>
  (state: RootState): AgreementCompanionFields[K] => {
    const agreementState = state.agreementDetailCreation;
    return (
      agreementState.localizedForm[agreementState.activeLanguage]?.companion[
        field
      ] ?? createEmptyLanguageFormState().companion[field]
    );
  };
