import { RootState } from '../../core/store';
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
  return agreementState.localizedForm[agreementState.activeLanguage];
};

export const selectFieldActiveAgreementLanguageForm =
  (field: AgreementDetailsFieldKey) => (state: RootState) => {
    const agreementState = state.agreementDetailCreation;
    return agreementState.localizedForm[agreementState.activeLanguage].details[
      field
    ];
  };

export const selectFieldActiveAgreementLanguageCompanionForm =
  <K extends keyof AgreementCompanionFields>(field: K) =>
  (state: RootState): AgreementCompanionFields[K] => {
    const agreementState = state.agreementDetailCreation;
    return agreementState.localizedForm[agreementState.activeLanguage]
      .companion[field];
  };
