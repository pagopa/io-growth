// import { RootState } from '../../core/store';
// import type {
//   AgreementCompanionFields,
//   AgreementDetailsFieldKey,
// } from './types';

// export const selectAgreementDetailCreationState = (state: RootState) =>
//   state.agreementDetailCreation;

// export const selectActiveAgreementLanguage = (state: RootState) =>
//   state.agreementDetailCreation.activeLanguage;

// export const selectActiveAgreementLanguageForm = (state: RootState) => {
//   const agreementState = state.agreementDetailCreation;
//   return agreementState.localizedForm[agreementState.activeLanguage];
// };

// export const selectFormFieldValue = (field: string) => (state: RootState) => {
//   console.log(field, 'ssss');
//   if (!field) return undefined;
//   const [root, ...deep] = field?.split('.');
//   const rootValue =
//     state.agreementDetailCreation.form[
//       root as keyof typeof state.agreementDetailCreation.form
//     ];
//   return [...(deep ?? [])].reduce((acc, key) => {
//     if (acc && typeof acc === 'object' && key in acc) {
//       return acc[key as keyof typeof acc];
//     }
//     return undefined;
//   }, rootValue);
// };

// export const selectFieldActiveAgreementLanguageForm =
//   (field: AgreementDetailsFieldKey) => (state: RootState) => {
//     const agreementState = state.agreementDetailCreation;
//     return agreementState.localizedForm[agreementState.activeLanguage].details[
//       field
//     ];
//   };

// export const selectFieldActiveAgreementLanguageCompanionForm =
//   <K extends keyof AgreementCompanionFields>(field: K) =>
//   (state: RootState): AgreementCompanionFields[K] => {
//     const agreementState = state.agreementDetailCreation;
//     return agreementState.localizedForm[agreementState.activeLanguage]
//       .companion[field];
//   };
