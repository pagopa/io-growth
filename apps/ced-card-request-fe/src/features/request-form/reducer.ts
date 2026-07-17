import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { NuovaDomandaInBozzaRequest } from '../../core/api/generated/model';

export type RequestFormState = NuovaDomandaInBozzaRequest;

const initialState: RequestFormState = {} as RequestFormState;

const requestFormSlice = createSlice({
  name: 'requestForm',
  initialState,
  reducers: {
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

export const { setField, setForm, resetForm } = requestFormSlice.actions;

export const requestFormReducer = requestFormSlice.reducer;
