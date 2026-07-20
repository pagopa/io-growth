import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ApplicationState } from '../../core/api/generated/model';

export type StatusState = {
  idLavorazione: string;
  state?: ApplicationState;
};

const initialState: StatusState = {} as StatusState;

const statusSlice = createSlice({
  name: 'requestForm',
  initialState,
  reducers: {
    setStatusField: (
      state,
      action: PayloadAction<{
        field: keyof StatusState;
        value: StatusState[keyof StatusState];
      }>,
    ) => {
      const { field, value } = action.payload;
      return {
        ...state,
        [field]: value,
      };
    },
    setStatus: (state, action: PayloadAction<StatusState>) => ({
      ...state,
      ...action.payload,
    }),
    resetForm: () => initialState,
  },
});

export const { setStatusField, setStatus, resetForm } = statusSlice.actions;

export const statusReducer = statusSlice.reducer;
