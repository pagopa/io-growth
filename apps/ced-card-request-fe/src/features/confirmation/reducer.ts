import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '../../core/store';
import { ConfermaDomandaRequest } from '../../generated/model';

type YesNo = 'yes' | 'no' | null;
type Province = 'trento' | 'bolzano' | 'aosta' | 'other' | null;

export type DocumentTypeFormState = {
  hasDoc: YesNo;
  province: Province;
  judgment: YesNo;
  inps: YesNo;
};

export type ConfirmationFormState = ConfermaDomandaRequest &
  DocumentTypeFormState;

const initialState: ConfirmationFormState = {} as ConfirmationFormState;

const confirmRequestFormSlice = createSlice({
  name: 'confirmRequestForm',
  initialState,
  reducers: {
    setField: (
      state,
      action: PayloadAction<{
        field: keyof ConfirmationFormState;
        value: ConfirmationFormState[keyof ConfirmationFormState];
      }>,
    ) => {
      const { field, value } = action.payload;
      return {
        ...state,
        [field]: value,
      };
    },
    setForm: (
      state,
      action: PayloadAction<Partial<ConfirmationFormState>>,
    ) => ({
      ...state,
      ...action.payload,
    }),
    resetForm: () => initialState,
  },
});

export const { setField, setForm, resetForm } = confirmRequestFormSlice.actions;
export const confirmRequestFormReducer = confirmRequestFormSlice.reducer;

export const selectConfirmationForm = (state: RootState) => state.confirmation;
export const selectConfirmationPayload = (state: RootState) => {
  const {
    idLavorazione,
    allegato,
    autodichiarazioneSentenza,
    dataSentenza,
    descrizioneComuneTribunale,
    dichiarazioneConformitaVerbale,
    dirittoAccompagnatore,
    nomeFile,
    siglaProvinciaTribunale,
    tipologiaUlterioreDocumentazione,
  } = state.confirmation;
  return {
    idLavorazione,
    allegato,
    autodichiarazioneSentenza,
    dataSentenza,
    descrizioneComuneTribunale,
    dichiarazioneConformitaVerbale,
    dirittoAccompagnatore,
    nomeFile,
    siglaProvinciaTribunale,
    tipologiaUlterioreDocumentazione,
  };
};
export const selectDocumentTypeForm = (state: RootState) => {
  const { province, hasDoc, judgment, inps } = state.confirmation;
  return { province, hasDoc, judgment, inps };
};
export const makeSelectConfirmationField = createSelector(
  selectConfirmationForm,
  (confirmation) => (field: keyof ConfirmationFormState) => confirmation[field],
);
