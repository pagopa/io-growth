import { baseApi } from '../../core/api/baseApi';
import { compactQueryParams } from '../../utils';

import type {
  OpportunityListResponse,
  OpportunityCategoryItem,
  ListOperatorOpportunitiesParams,
} from '../../core/api/generated/model';

export const benefitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBenefits: builder.query<
      OpportunityListResponse,
      ListOperatorOpportunitiesParams
    >({
      query: (params) => ({
        url: '/operator/opportunities',
        params: compactQueryParams(params),
      }),
      providesTags: ['Benefits'],
    }),
    getOpportunityCategories: builder.query<OpportunityCategoryItem[], void>({
      query: () => '/opportunity-categories',
      keepUnusedDataFor: 3600,
    }),
  }),
});

export const { useGetBenefitsQuery, useGetOpportunityCategoriesQuery } =
  benefitsApi;
