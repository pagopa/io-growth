import { RootState } from '../../core/store';

export const selectAccessPoint = (state: RootState) => state.places.accessPoint;
export const selectSelectedLocationIds = (state: RootState) =>
  state.places.selectedLocationIds;
export const selectSelectedWebsiteIds = (state: RootState) =>
  state.places.selectedWebsiteIds;
