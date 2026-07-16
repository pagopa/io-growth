import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ConfermaDomandaRequest } from '../../core/api/generated/model';

export type ConfirmRequestFormState = ConfermaDomandaRequest;

const initialState: ConfirmRequestFormState = {} as ConfirmRequestFormState;

const confirmRequestFormSlice = createSlice({
  name: 'requestForm',
  initialState,
  reducers: {
    setField: (
      state,
      action: PayloadAction<{
        field: keyof ConfirmRequestFormState;
        value: ConfirmRequestFormState[keyof ConfirmRequestFormState];
      }>,
    ) => {
      const { field, value } = action.payload;
      state = {
        ...state,
        [field]: value,
      };
    },
    setForm: (
      state,
      action: PayloadAction<Partial<ConfirmRequestFormState>>,
    ) => ({
      ...state,
      ...action.payload,
    }),
    resetForm: () => initialState,
  },
});

export const { setField, setForm, resetForm } = confirmRequestFormSlice.actions;

export const confirmRequestFormReducer = confirmRequestFormSlice.reducer;
