import { baseApi } from '../../core/api/baseApi';
import type { BenefitsResponse } from './types';

export const benefitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBenefits: builder.query<BenefitsResponse, void>({
      query: () => '/benefits',
      providesTags: ['Benefits'],
    }),
  }),
});

export const { useGetBenefitsQuery } = benefitsApi;
