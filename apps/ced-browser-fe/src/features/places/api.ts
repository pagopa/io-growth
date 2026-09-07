import { baseApi } from '../../core/api/baseApi';
import type {
  PlaceSearchResponse,
  PlaceDetail,
} from '../../core/api/generated/model';

const placesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchPlaces: builder.query<PlaceSearchResponse, string>({
      query: (q) => `/search?q=${encodeURIComponent(q)}`,
      providesTags: ['Places'],
    }),
    getAccessPointDetail: builder.query<PlaceDetail, { accessPointId: string }>(
      {
        query: ({ accessPointId }) => `/places/${accessPointId}`,
        providesTags: (_result, _error, { accessPointId }) => [
          { type: 'Places', id: accessPointId },
        ],
      },
    ),
  }),
});

export const { useSearchPlacesQuery, useGetAccessPointDetailQuery } = placesApi;
