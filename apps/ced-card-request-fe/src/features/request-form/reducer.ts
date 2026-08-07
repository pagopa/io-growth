import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { NuovaDomandaInBozzaRequest } from '../../core/api/generated/model';

export type RequestFormState = NuovaDomandaInBozzaRequest;
export type ApplicantDataPrefill = Partial<
  Pick<
    RequestFormState,
    | 'cognome'
    | 'comuneNascita'
    | 'dataNascita'
    | 'nome'
    | 'sesso'
    | 'siglaProvinciaNascita'
    | 'statoNascita'
  >
>;

const initialState: RequestFormState = {} as RequestFormState;

const requestFormSlice = createSlice({
  name: 'requestForm',
  initialState,
  reducers: {
    prefillApplicantData: (
      state,
      action: PayloadAction<ApplicantDataPrefill>,
    ) => ({
      ...state,
      ...(!state.nome && action.payload.nome
        ? { nome: action.payload.nome }
        : {}),
      ...(!state.cognome && action.payload.cognome
        ? { cognome: action.payload.cognome }
        : {}),
      ...(!state.sesso && action.payload.sesso
        ? { sesso: action.payload.sesso }
        : {}),
      ...(!state.dataNascita && action.payload.dataNascita
        ? { dataNascita: action.payload.dataNascita }
        : {}),
      ...(!state.comuneNascita && action.payload.comuneNascita
        ? { comuneNascita: action.payload.comuneNascita }
        : {}),
      ...(!state.siglaProvinciaNascita && action.payload.siglaProvinciaNascita
        ? { siglaProvinciaNascita: action.payload.siglaProvinciaNascita }
        : {}),
      ...(!state.statoNascita && action.payload.statoNascita
        ? { statoNascita: action.payload.statoNascita }
        : {}),
    }),
    setField: (
      state,
      action: PayloadAction<{
        field: keyof RequestFormState;
        value: RequestFormState[keyof RequestFormState];
      }>,
    ) => {
      const { field, value } = action.payload;
      return {
        ...state,
        [field]: value,
      };
    },
    setForm: (state, action: PayloadAction<Partial<RequestFormState>>) => ({
      ...state,
      ...action.payload,
    }),
    resetForm: () => initialState,
  },
});

export const { prefillApplicantData, setField, setForm, resetForm } =
  requestFormSlice.actions;

export const requestFormReducer = requestFormSlice.reducer;
