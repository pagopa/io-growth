import { baseApi } from '../../core/api/baseApi.js';
import type { EntityDetail, OpportunityDetail } from './types.js';
import type {
  AccessPointSearchResponse,
  AccessPointDetail,
} from '../../core/api/generated/model';

export const entitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // E2E BE connected endpoints
    searchEntities: builder.query<AccessPointSearchResponse, string>({
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
    // mocked endpoints
    getEntityDetail: builder.query<EntityDetail, string>({
      query: (id) => `/entities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Entities', id }],
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
