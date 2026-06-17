import { baseApi } from '../../core/api/baseApi';
import type { EntityDetail } from './types';

export const entitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // mocked endpoints
    getEntityDetail: builder.query<EntityDetail, string>({
      query: (id) => `/entities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Entities', id }],
    }),
  }),
});

export const { useGetEntityDetailQuery } = entitiesApi;
