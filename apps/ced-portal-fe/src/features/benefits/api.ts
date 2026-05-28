import { baseApi } from '../../core/api/baseApi';
import { compactQueryParams } from '../../utils';
import type {
  BenefitsQueryParams,
  BenefitsResponse,
  OpportunityCategory,
  SaveBenefitDraftResponse,
} from './types';

export const benefitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBenefits: builder.query<BenefitsResponse, BenefitsQueryParams>({
      query: (params) => ({
        url: '/operator/opportunities',
        params: compactQueryParams(params),
      }),
      providesTags: ['Benefits'],
    }),
    getOpportunityCategories: builder.query<OpportunityCategory[], void>({
      query: () => '/opportunity-categories',
      keepUnusedDataFor: 3600,
    }),
    saveBenefitDraft: builder.mutation<SaveBenefitDraftResponse, unknown>({
      query: (body) => ({
        url: '/benefits/draft',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Benefits'],
    }),
  }),
});

export const {
  useGetBenefitsQuery,
  useGetOpportunityCategoriesQuery,
  useSaveBenefitDraftMutation,
} = benefitsApi;
