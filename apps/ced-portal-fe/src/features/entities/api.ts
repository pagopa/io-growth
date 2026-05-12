import { baseApi } from '../../core/api/baseApi.js';
import type { EntitiesResponse } from './types.js';

export const entitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEntities: builder.query<EntitiesResponse, void>({
      query: () => '/entities',
      providesTags: ['Entities'],
    }),
  }),
});

export const { useGetEntitiesQuery } = entitiesApi;
