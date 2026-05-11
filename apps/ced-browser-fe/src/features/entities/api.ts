import { baseApi } from '../../core/api/baseApi.js';
import { EntityDetail, EntitySearchResponse } from './types.js';

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
  }),
});

export const { useGetEntityDetailQuery, useSearchEntitiesQuery } = entitiesApi;
