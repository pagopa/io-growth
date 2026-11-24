import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ApplicationState } from '../../generated/model';
import type { StatusResponse } from '../read-only-apis/api';

type StatusState = {
  idLavorazione: string;
  state?: ApplicationState;
  numDomus?: string;
  user?: StatusResponse['user'];
};

const initialState: StatusState = {} as StatusState;

const statusSlice = createSlice({
  name: 'status',
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

export const { resetForm, setStatusField, setStatus } = statusSlice.actions;

export const statusReducer = statusSlice.reducer;
