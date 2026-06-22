import { baseApi } from '../../core/api/baseApi';
import type {
  PlaceSearchResponse,
  PlaceDetail,
} from '../../core/api/generated/model';

export const placesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // E2E BE connected endpoints
    searchPlaces: builder.query<PlaceSearchResponse, string>({
      query: (q) => `/search?q=${encodeURIComponent(q)}`,
      providesTags: ['Places'],
    }),
    getAccessPointDetail: builder.query<
      PlaceDetail,
      { entityId: string; accessPointId: string }
    >({
      query: ({ accessPointId }) => `/places/${accessPointId}`,
      providesTags: (_result, _error, { accessPointId }) => [
        { type: 'Places', id: accessPointId },
      ],
    }),
  }),
});

export const { useSearchPlacesQuery, useGetAccessPointDetailQuery } = placesApi;
