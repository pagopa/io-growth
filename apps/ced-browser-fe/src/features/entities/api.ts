import { baseApi } from '../../core/api/baseApi.js';
import { OperatorProfileDetail } from '../../core/api/generated/model/operatorProfileDetail.js';

export const entitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEntityDetail: builder.query<OperatorProfileDetail, string>({
      query: (id) => `/profiles//${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Entities', id }],
    }),
  }),
});

export const { useGetEntityDetailQuery } = entitiesApi;
