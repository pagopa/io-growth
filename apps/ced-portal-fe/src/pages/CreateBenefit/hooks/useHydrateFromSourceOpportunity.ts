import { useEffect, useRef } from 'react';
import { useGetOpportunityDetailQuery } from '../../../features/opportunities/api';
import { useAppDispatch } from '../../../hooks/store';
import type { CreateBenefitNavigationState } from '../types';
import {
  setField,
  setBenefit,
  setLocalizedValue,
} from '../../../features/opportunityCreation/opportunityCreationSlice';
import {
  setAccessPoint,
  setSelectedLocationIds,
  setSelectedWebsiteIds,
} from '../../../features/places/placesSlice';
import { useGetPlacesQuery } from '../../../features/places/api';
import { PlaceBaseType } from '../../../core/api/generated/model';

type PlacesMap = {
  locations: Array<string>;
  websites: Array<string>;
};

export const useHydrateFromSourceOpportunity = (
  sourceOpportunityId:
    | CreateBenefitNavigationState['sourceOpportunityId']
    | null,
) => {
  const dispatch = useAppDispatch();
  const hydratedSourceRef = useRef<string | null>(null);

  const { data: sourceOpportunityDetail } = useGetOpportunityDetailQuery(
    sourceOpportunityId ?? '',
    {
      skip: !sourceOpportunityId,
    },
  );

  const { data: places } = useGetPlacesQuery();

  const {
    beneficiaryBenefit,
    categoryId,
    dateFrom,
    placeIds,
    localizedMetadata,
    url,
    dateTo,
    caregiverBenefit,
    nationalTerritory,
  } = sourceOpportunityDetail ?? {};

  useEffect(() => {
    hydratedSourceRef.current = null;
  }, [sourceOpportunityId]);

  useEffect(() => {
    if (!sourceOpportunityId || !sourceOpportunityDetail) {
      return;
    }

    if (hydratedSourceRef.current === sourceOpportunityId) {
      return;
    }

    dispatch(setField({ field: 'dateFrom', value: dateFrom }));
    dispatch(setField({ field: 'dateTo', value: dateTo }));
    dispatch(setField({ field: 'url', value: url }));
    dispatch(setField({ field: 'categoryId', value: categoryId }));
    dispatch(setField({ field: 'placeIds', value: placeIds }));
    dispatch(
      setField({ field: 'nationalTerritory', value: nationalTerritory }),
    );

    const placesIdsMapped = placeIds?.reduce<PlacesMap>(
      (acc, placeId) => {
        const place = places?.find(({ id }) => id === placeId);
        const newLocation = place?.type === 'offline' ? place.id : '';
        const newWebsite = place?.type === 'online' ? place.id : '';
        return {
          locations: [...acc.locations, newLocation].filter(Boolean),
          websites: [...acc.websites, newWebsite].filter(Boolean),
        };
      },
      {
        locations: [],
        websites: [],
      },
    );

    if (
      placesIdsMapped?.locations.length ||
      placesIdsMapped?.websites.length ||
      nationalTerritory
    ) {
      dispatch(setSelectedLocationIds(placesIdsMapped?.locations ?? []));
      dispatch(setSelectedWebsiteIds(placesIdsMapped?.websites ?? []));

      const accessPoint: PlaceBaseType | 'both' = placesIdsMapped?.websites
        .length
        ? 'online'
        : placesIdsMapped?.locations.length || nationalTerritory
          ? 'offline'
          : 'both';
      dispatch(setAccessPoint(accessPoint));
    }

    localizedMetadata?.map((payload) => dispatch(setLocalizedValue(payload)));

    if (caregiverBenefit) {
      dispatch(
        setBenefit({
          which: 'caregiverBenefit',
          value: caregiverBenefit ?? null,
        }),
      );
    }

    if (beneficiaryBenefit) {
      dispatch(
        setBenefit({
          which: 'beneficiaryBenefit',
          value: beneficiaryBenefit ?? null,
        }),
      );
    }

    hydratedSourceRef.current = sourceOpportunityId;
  }, [
    beneficiaryBenefit,
    caregiverBenefit,
    categoryId,
    dateFrom,
    dateTo,
    dispatch,
    localizedMetadata,
    nationalTerritory,
    placeIds,
    places,
    sourceOpportunityDetail,
    sourceOpportunityId,
    url,
  ]);
};
