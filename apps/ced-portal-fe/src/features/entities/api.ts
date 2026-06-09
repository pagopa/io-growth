import { baseApi } from '../../core/api/baseApi.js';
import {
  getCompleteOnboardingUrl,
  getGetContractSignedUrl,
  getGetOnboardingUrl,
  getListOnboardingsUrl,
} from '../../core/api/generated/endpoints/department/department';
import type {
  CompleteOnboardingBody,
  ListOnboardingsParams,
  PendingOnboardingsResponse,
} from '../../core/api/generated/model';
import type { EntityDetail } from './types.js';

export type ListDepartmentOnboardingsParams = ListOnboardingsParams;

export const entitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listDepartmentOnboardings: builder.query<
      PendingOnboardingsResponse,
      ListDepartmentOnboardingsParams
    >({
      query: (params) => getListOnboardingsUrl(params),
      providesTags: ['Entities'],
    }),
    getDepartmentOnboarding: builder.query<EntityDetail, string>({
      query: (id) => getGetOnboardingUrl(id),
      providesTags: ['Entities'],
    }),
    getContractSigned: builder.mutation<Blob, { onboardingId: string }>({
      query: ({ onboardingId }) => ({
        url: getGetContractSignedUrl(onboardingId),
        responseHandler: async (response) => response.blob(),
      }),
    }),
    completeOnboarding: builder.mutation<
      void,
      { onboardingId: string; contract: File }
    >({
      query: ({ onboardingId, contract }) => {
        const formData = new FormData();
        const payload: CompleteOnboardingBody = { contract };
        formData.append('contract', payload.contract);

        return {
          url: getCompleteOnboardingUrl(onboardingId),
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['Entities'],
    }),
  }),
});

export const {
  useListDepartmentOnboardingsQuery,
  useGetDepartmentOnboardingQuery,
  useGetContractSignedMutation,
  useCompleteOnboardingMutation,
} = entitiesApi;
