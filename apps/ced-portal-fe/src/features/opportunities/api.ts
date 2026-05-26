import { baseApi } from '../../core/api/baseApi';
import type { OpportunitiesResponse, OpportunityDetail } from './types';

export const opportunitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOpportunities: builder.query<OpportunitiesResponse, void>({
      query: () => '/operator/opportunities',
      providesTags: ['Opportunities'],
    }),
    getOpportunityDetail: builder.query<OpportunityDetail, string>({
      query: (id) => `/operator/opportunities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Opportunities', id }],
    }),
    requestApproval: builder.mutation<void, string>({
      query: (id) => ({
        url: `/operator/opportunities/${id}/request-test`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Opportunities', id },
        'Opportunities',
      ],
    }),
  }),
});

export const {
  useGetOpportunitiesQuery,
  useGetOpportunityDetailQuery,
  useRequestApprovalMutation,
} = opportunitiesApi;
