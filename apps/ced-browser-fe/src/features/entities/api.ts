import { baseApi } from '../../core/api/baseApi.js';
import type {
  EntityDetail,
  EntitySearchResponse,
  AccessPointDetail,
  OpportunityDetail,
} from './types.js';

export const entitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEntityDetail: builder.query<EntityDetail, string>({
      query: (id) => `/entities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Entities', id }],
    }),
    searchEntities: builder.query<EntitySearchResponse, string>({
      query: (q) => `/entities/search?q=${encodeURIComponent(q)}`,
      providesTags: ['Entities'],
    }),
    getAccessPointDetail: builder.query<
      AccessPointDetail,
      { entityId: string; accessPointId: string }
    >({
      query: ({ entityId, accessPointId }) =>
        `/entities/${entityId}/access-points/${accessPointId}`,
      providesTags: (_result, _error, { entityId, accessPointId }) => [
        { type: 'Entities', id: `${entityId}-ap-${accessPointId}` },
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
