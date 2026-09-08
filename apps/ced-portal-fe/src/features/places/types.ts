import type { PlaceBaseType, PlaceResponseBase } from '../../generated/model';

export interface PlacesState {
  accessPoint: PlaceBaseType | 'both' | null;
  selectedLocationIds: Array<PlaceResponseBase['id']>;
  selectedWebsiteIds: Array<PlaceResponseBase['id']>;
}
