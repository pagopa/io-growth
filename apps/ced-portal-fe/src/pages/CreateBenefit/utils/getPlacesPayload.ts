import type { PlacesState } from '../../../features/places/types';

type GetPlacesPayloadInput = {
  accessPoint: PlacesState['accessPoint'];
  nationalTerritory: boolean | undefined;
  locationIds: PlacesState['selectedLocationIds'];
  websiteIds: PlacesState['selectedWebsiteIds'];
};

type PlacesPayload = {
  placeIds: string[];
  nationalTerritory: boolean | undefined;
};

export const getPlacesPayload = ({
  accessPoint,
  nationalTerritory,
  locationIds,
  websiteIds,
}: GetPlacesPayloadInput): PlacesPayload => {
  const effectiveLocationIds = nationalTerritory ? [] : locationIds;

  switch (accessPoint) {
    case 'offline':
      return { placeIds: [...effectiveLocationIds], nationalTerritory };
    case 'online':
      return { placeIds: [...websiteIds], nationalTerritory: false };
    case 'both':
    case null:
      return {
        placeIds: [...effectiveLocationIds, ...websiteIds],
        nationalTerritory,
      };
  }
};
