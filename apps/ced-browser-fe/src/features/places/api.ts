import { baseApi } from '../../core/api/baseApi.js';
import type { EntityDetail, OpportunityDetail } from './types';
import type {
  AccessPointSearchResponse,
  AccessPointDetail,
} from '../../core/api/generated/model';

export const placesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // E2E BE connected endpoints
    searchPlaces: builder.query<AccessPointSearchResponse, string>({
      query: (q) => `/api/search?q=${encodeURIComponent(q)}`,
      providesTags: ['Places'],
    }),
    getAccessPointDetail: builder.query<
      AccessPointDetail,
      { entityId: string; accessPointId: string }
    >({
      query: ({ accessPointId }) => `/api/places/${accessPointId}`,
      providesTags: (_result, _error, { accessPointId }) => [
        { type: 'Places', id: accessPointId },
      ],
    }),
    // mocked endpoints
    getEntityDetail: builder.query<EntityDetail, string>({
      query: (id) => `/places/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Places', id }],
    }),
    getOpportunityDetail: builder.query<OpportunityDetail, string>({
      query: (id) => `/opportunities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Opportunities', id }],
    }),
  }),
});

export const {
  useGetEntityDetailQuery,
  useSearchPlacesQuery,
  useGetAccessPointDetailQuery,
  useGetOpportunityDetailQuery,
} = placesApi;
