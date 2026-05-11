import { baseApi } from '../../core/api/baseApi.js';
import { EntityDetail } from './types.js';

export const entitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEntityDetail: builder.query<EntityDetail, string>({
      query: (id) => `/entities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Entities', id }],
    }),
  }),
});

export const { useGetEntityDetailQuery } = entitiesApi;
