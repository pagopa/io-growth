import { baseApi } from '../../core/api/baseApi.js';
import type { EntityDetail, EntitiesResponse } from './types.js';

export const entitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEntities: builder.query<EntitiesResponse, void>({
      query: () => '/entities',
    }),
    getEntityDetail: builder.query<EntityDetail, string>({
      query: (id) => `/entities/${id}`,
    }),
  }),
});

export const { useGetEntitiesQuery, useGetEntityDetailQuery } = entitiesApi;
