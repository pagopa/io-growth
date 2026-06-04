import type {
  PlaceBaseType,
  PlaceResponseBase,
} from '../../core/api/generated/model';

export interface PlacesState {
  accessPoint: PlaceBaseType | 'both' | null;
  nationwide: boolean;
  selectedLocationIds: Array<PlaceResponseBase['id']>;
  selectedWebsiteIds: Array<PlaceResponseBase['id']>;
}
