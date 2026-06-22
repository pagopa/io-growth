import { baseApi } from '../../core/api/baseApi.js';
import type {
  OpportunityDetail,
  OpportunitySearchResponse,
  SearchOpportunitiesParams,
} from '../../core/api/generated/model/index.js';
import { searchQueryGenerator } from '../../utils/searchQueryGenerator.js';

export const opportunitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOpportunitiesSearch: builder.query<
      OpportunitySearchResponse,
      SearchOpportunitiesParams
    >({
      query: (params) =>
        `/opportunities/search?${searchQueryGenerator(params)}`,
    }),
    getOpportunityDetail: builder.query<OpportunityDetail, string>({
      query: (id) => `/opportunities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Opportunities', id }],
    }),
  }),
});

export const { useGetOpportunityDetailQuery, useGetOpportunitiesSearchQuery } =
  opportunitiesApi;
