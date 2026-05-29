import { baseApi } from '../../core/api/baseApi';
import { OpportunityCreateRequest } from '../../core/api/generated/model';
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
    createOpportunity: builder.mutation<any, OpportunityCreateRequest>({
      query: (opportunity: OpportunityCreateRequest) => ({
        url: '/operator/opportunities',
        method: 'POST',
        body: opportunity,
      }),
    }),
    requestApproval: builder.mutation<void, string>({
      query: (id) => ({
        url: `/operator/opportunities/${id}/request-test`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Opportunities', id },
        'Opportunities',
        'Benefits',
      ],
    }),
  }),
});

export const {
  useGetOpportunitiesQuery,
  useGetOpportunityDetailQuery,
  useCreateOpportunityMutation,
  useRequestApprovalMutation,
} = opportunitiesApi;
