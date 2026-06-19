import { baseApi } from '../../core/api/baseApi.js';
import type {
  PlaceSearchResponse,
  PlaceDetail,
  OpportunityDetail,
} from '../../core/api/generated/model/index.js';
import type { EntityDetail } from './types.js';

export const entitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEntityDetail: builder.query<EntityDetail, string>({
      query: (id) => `/entities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Entities', id }],
    }),
    searchEntities: builder.query<PlaceSearchResponse, string>({
      query: (q) => `/search?q=${encodeURIComponent(q)}`,
      providesTags: ['Entities'],
    }),
    getAccessPointDetail: builder.query<
      PlaceDetail,
      { accessPointId: string; language?: string }
    >({
      query: ({ accessPointId, language }) => ({
        url: `/places/${accessPointId}`,
        headers: language ? { 'Accept-Language': language } : {},
      }),
      providesTags: (_result, _error, { accessPointId }) => [
        { type: 'Entities', id: accessPointId },
      ],
    }),
    getOpportunityDetail: builder.query<OpportunityDetail, string>({
      query: (id) => `/opportunities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Opportunities', id }],
    }),
  }),
});

export const {
  useGetEntityDetailQuery,
  useSearchEntitiesQuery,
  useGetAccessPointDetailQuery,
  useGetOpportunityDetailQuery,
} = entitiesApi;
