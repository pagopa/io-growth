import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../core/store';

type PhotoState = {
  B64_photo?: string;
  preview?: string;
};

const initialState: PhotoState = {};

const photoSlice = createSlice({
  name: 'requestForm',
  initialState,
  reducers: {
    setFile: (state, action: PayloadAction<string>) => {
      state.B64_photo = action.payload;
    },
    setPreview: (state, action: PayloadAction<string | undefined>) => {
      state.preview = action.payload;
    },
  },
});

export const { setFile, setPreview } = photoSlice.actions;

export const photoReducer = photoSlice.reducer;

export const selectB64Photo = (state: RootState) => state.photo.B64_photo;
export const selectPhotoPreview = (state: RootState) => state.photo.preview;
