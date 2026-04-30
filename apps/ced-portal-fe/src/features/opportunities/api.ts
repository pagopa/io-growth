import { baseApi } from '../../core/api/baseApi';
import type { OpportunitiesResponse, OpportunityDetail } from './types';

export const opportunitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOpportunities: builder.query<OpportunitiesResponse, void>({
      query: () => '/opportunities',
      providesTags: ['Opportunities'],
    }),
    getOpportunityDetail: builder.query<OpportunityDetail, string>({
      query: (id) => `/opportunities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Opportunities', id }],
    }),
  }),
});

export const { useGetOpportunitiesQuery, useGetOpportunityDetailQuery } =
  opportunitiesApi;
