import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { PlacesState } from './types';

const initialState: PlacesState = {
  accessPoint: null,
  nationwide: false,
  selectedLocationIds: [],
  selectedWebsiteIds: [],
};

const placesSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    setAccessPoint(state, action: PayloadAction<PlacesState['accessPoint']>) {
      state.accessPoint = action.payload;
    },
    setNationwide(state, action: PayloadAction<boolean>) {
      state.nationwide = action.payload;
    },
    setSelectedLocationIds(
      state,
      action: PayloadAction<PlacesState['selectedLocationIds']>,
    ) {
      state.selectedLocationIds = action.payload;
    },
    removeSelectedLocationId(state, action: PayloadAction<string>) {
      state.selectedLocationIds = state.selectedLocationIds.filter(
        (id) => id !== action.payload,
      );
    },
    setSelectedWebsiteIds(
      state,
      action: PayloadAction<PlacesState['selectedWebsiteIds']>,
    ) {
      state.selectedWebsiteIds = action.payload;
    },
    removeSelectedWebsiteId(state, action: PayloadAction<string>) {
      state.selectedWebsiteIds = state.selectedWebsiteIds.filter(
        (id) => id !== action.payload,
      );
    },
    resetPlaces(state) {
      state.accessPoint = initialState.accessPoint;
      state.nationwide = initialState.nationwide;
      state.selectedLocationIds = initialState.selectedLocationIds;
      state.selectedWebsiteIds = initialState.selectedWebsiteIds;
    },
  },
});

export const {
  setAccessPoint,
  setNationwide,
  setSelectedLocationIds,
  removeSelectedLocationId,
  setSelectedWebsiteIds,
  removeSelectedWebsiteId,
  resetPlaces,
} = placesSlice.actions;

export const placesReducer = placesSlice.reducer;
