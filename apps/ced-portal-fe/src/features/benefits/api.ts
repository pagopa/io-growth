import { baseApi } from '../../core/api/baseApi';
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
        params: {
          ...(params.offset !== undefined && { offset: params.offset }),
          ...(params.limit !== undefined && { limit: params.limit }),
          ...(params.categoryId && { categoryId: params.categoryId }),
          ...(params.status && { status: params.status }),
          ...(params.search && { search: params.search }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        },
      }),
      providesTags: ['Benefits'],
    }),
    getOpportunityCategories: builder.query<OpportunityCategory[], void>({
      query: () => '/opportunity-categories',
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
