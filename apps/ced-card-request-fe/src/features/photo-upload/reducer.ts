import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../core/store';

type PhotoState = {
  B64_photo?: string;
};

const initialState: PhotoState = {};

const photoSlice = createSlice({
  name: 'requestForm',
  initialState,
  reducers: {
    setFile: (state, action: PayloadAction<string>) => {
      state.B64_photo = action.payload;
    },
  },
});

export const { setFile } = photoSlice.actions;

export const photoReducer = photoSlice.reducer;

export const selectB64Photo = (state: RootState) => state.photo.B64_photo;
