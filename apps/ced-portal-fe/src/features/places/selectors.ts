import { RootState } from '../../core/store';
import { placesApi } from './api';

export const selectAccessPoint = (state: RootState) => state.places.accessPoint;
export const selectNationwide = (state: RootState) => state.places.nationwide;
export const selectSelectedLocationIds = (state: RootState) =>
  state.places.selectedLocationIds;
export const selectSelectedWebsiteIds = (state: RootState) =>
  state.places.selectedWebsiteIds;

// RTK Query selectors
export const selectGetPlacesQueryState = placesApi.endpoints.getPlaces.select();
export const selectGetPlaces = (state: RootState) =>
  selectGetPlacesQueryState(state)?.data ?? [];
