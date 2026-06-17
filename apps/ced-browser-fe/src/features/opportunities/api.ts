import { baseApi } from '../../core/api/baseApi';
import { OpportunityDetail } from '../../core/api/generated/model';

export const opportunitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // E2E BE connected endpoints
    getOpportunityDetail: builder.query<OpportunityDetail, string>({
      query: (id) => `/opportunities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Opportunities', id }],
    }),
  }),
});

export const { useGetOpportunityDetailQuery } = opportunitiesApi;
