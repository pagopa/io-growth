import { baseApi } from '../../core/api/baseApi';
import type { BenefitsResponse, SaveBenefitDraftResponse } from './types';

export const benefitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBenefits: builder.query<BenefitsResponse, void>({
      query: () => '/benefits',
      providesTags: ['Benefits'],
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

export const { useGetBenefitsQuery, useSaveBenefitDraftMutation } = benefitsApi;
