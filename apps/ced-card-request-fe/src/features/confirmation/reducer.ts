import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ConfermaDomandaRequest } from '../../core/api/generated/model';

const initialState: ConfermaDomandaRequest = {} as ConfermaDomandaRequest;

const confirmRequestFormSlice = createSlice({
  name: 'confirmRequestForm',
  initialState,
  reducers: {
    setField: (
      state,
      action: PayloadAction<{
        field: keyof ConfermaDomandaRequest;
        value: ConfermaDomandaRequest[keyof ConfermaDomandaRequest];
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
      action: PayloadAction<Partial<ConfermaDomandaRequest>>,
    ) => ({
      ...state,
      ...action.payload,
    }),
    resetForm: () => initialState,
  },
});

export const confirmRequestFormReducer = confirmRequestFormSlice.reducer;
