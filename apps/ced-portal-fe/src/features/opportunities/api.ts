import { baseApi } from '../../core/api/baseApi';
import {
  AdminOpportunityListResponse,
  ListOperatorOpportunitiesParams,
  OpportunityCategoryItem,
  OpportunityCreateRequest,
  OperatorDeleteOpportunityBody,
} from '../../core/api/generated/model';
import {
  getApproveOpportunityUrl,
  getCancelScheduledSuspensionUrl,
  getGetOpportunityUrl,
  getOperatorCancelScheduledSuspensionUrl,
  getOperatorSuspendOpportunityUrl,
  getSuspendOpportunityUrl,
} from '../../core/api/generated/endpoints/opportunities/opportunities';
import type {
  AdminOpportunityDetail,
  ApproveOpportunityPayload,
  ListAdminOpportunitiesParams,
  OpportunitiesResponse,
  OpportunityDetail,
  SuspendOpportunityPayload,
} from './types';
import { compactQueryParams } from '../../utils';

const getListAdminOpportunitiesUrl = (
  params?: ListAdminOpportunitiesParams,
) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : value.toString());
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0
    ? `/opportunities?${stringifiedParams}`
    : '/opportunities';
};

export const opportunitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOperatorOpportunities: builder.query<
      OpportunitiesResponse,
      ListOperatorOpportunitiesParams
    >({
      query: (params) => ({
        url: '/operator/opportunities',
        params: compactQueryParams(params),
      }),
      providesTags: ['Opportunities'],
    }),
    getOpportunityDetail: builder.query<OpportunityDetail, string>({
      query: (id) => `/operator/opportunities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Opportunities', id }],
    }),
    getAdminOpportunities: builder.query<
      AdminOpportunityListResponse,
      ListAdminOpportunitiesParams | undefined
    >({
      query: (params) => getListAdminOpportunitiesUrl(params),
      providesTags: ['Opportunities'],
    }),
    getAdminOpportunityDetail: builder.query<AdminOpportunityDetail, string>({
      query: (id) => getGetOpportunityUrl(id),
      providesTags: (_result, _error, id) => [{ type: 'Opportunities', id }],
    }),
    getOpportunityCategories: builder.query<OpportunityCategoryItem[], void>({
      query: () => '/opportunity-categories',
      keepUnusedDataFor: 3600,
    }),
    createOpportunity: builder.mutation<
      OpportunityDetail,
      OpportunityCreateRequest
    >({
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
    approveOpportunity: builder.mutation<
      void,
      { id: string; payload?: ApproveOpportunityPayload }
    >({
      query: ({ id, payload }) => ({
        url: getApproveOpportunityUrl(id),
        method: 'PATCH',
        ...(payload ? { body: payload } : {}),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Opportunities', id },
        'Opportunities',
      ],
    }),
    adminSuspendOpportunity: builder.mutation<
      void,
      { id: string; payload: SuspendOpportunityPayload }
    >({
      query: ({ id, payload }) => ({
        url: getSuspendOpportunityUrl(id),
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Opportunities', id },
        'Opportunities',
      ],
    }),
    adminCancelScheduledSuspension: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: getCancelScheduledSuspensionUrl(id),
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Opportunities', id },
        'Opportunities',
      ],
    }),
    deleteOpportunity: builder.mutation<
      void,
      { id: string; payload?: OperatorDeleteOpportunityBody }
    >({
      query: ({ id, payload }) => ({
        url: `/operator/opportunities/${id}/delete`,
        method: 'PATCH',
        ...(payload ? { body: payload } : {}),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Opportunities', id },
        'Opportunities',
      ],
    }),
    operatorSuspendOpportunity: builder.mutation<
      void,
      { id: string; payload: SuspendOpportunityPayload }
    >({
      query: ({ id, payload }) => ({
        url: getOperatorSuspendOpportunityUrl(id),
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Opportunities', id },
        'Opportunities',
      ],
    }),
    operatorCancelScheduledSuspension: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: getOperatorCancelScheduledSuspensionUrl(id),
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Opportunities', id },
        'Opportunities',
      ],
    }),
  }),
});

export const {
  useGetOperatorOpportunitiesQuery,
  useGetOpportunityDetailQuery,
  useGetAdminOpportunitiesQuery,
  useGetOpportunityCategoriesQuery,
  useGetAdminOpportunityDetailQuery,
  useCreateOpportunityMutation,
  useRequestApprovalMutation,
  useApproveOpportunityMutation,
  useAdminSuspendOpportunityMutation,
  useAdminCancelScheduledSuspensionMutation,
  useDeleteOpportunityMutation,
  useOperatorSuspendOpportunityMutation,
  useOperatorCancelScheduledSuspensionMutation,
} = opportunitiesApi;
