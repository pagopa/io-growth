import { baseApi } from '../../core/api/baseApi.js';
import {
  getCompleteOnboardingUrl,
  getGetContractSignedUrl,
  getGetOnboardingUrl,
} from '../../core/api/generated/endpoints/department/department';
import type {
  CompleteOnboardingBody,
  ListOnboardingsParams,
  PendingOnboardingsResponse,
} from '../../core/api/generated/model';
import type { EntityDetail } from './types.js';

type ListDepartmentOnboardingsParams = ListOnboardingsParams;

const getListDepartmentOnboardingsUrl = (
  params: ListDepartmentOnboardingsParams,
) => {
  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.append('page', String(params.page));
  }

  if (params.size !== undefined) {
    query.append('size', String(params.size));
  }

  if (params.name) {
    query.append('name', params.name);
  }

  params.statuses?.forEach((status) => {
    query.append('statuses', status);
  });

  const stringified = query.toString();
  return stringified
    ? `/department/onboardings?${stringified}`
    : '/department/onboardings';
};

const entitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listDepartmentOnboardings: builder.query<
      PendingOnboardingsResponse,
      ListDepartmentOnboardingsParams
    >({
      query: (params) => getListDepartmentOnboardingsUrl(params),
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
    rejectOnboarding: builder.mutation<
      void,
      { onboardingId: string; reason: string }
    >({
      query: ({ onboardingId, reason }) => ({
        url: `/department/onboardings/${onboardingId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Entities'],
    }),
  }),
});

export const {
  useListDepartmentOnboardingsQuery,
  useGetDepartmentOnboardingQuery,
  useGetContractSignedMutation,
  useCompleteOnboardingMutation,
  useRejectOnboardingMutation,
} = entitiesApi;
