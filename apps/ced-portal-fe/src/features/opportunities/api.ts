import { baseApi } from '../../core/api/baseApi';
import { OpportunityCreateRequest } from '../../core/api/generated/model';
import type {
  AdminOpportunitiesResponse,
  AdminOpportunityDetail,
  ApproveOpportunityPayload,
  ListAdminOpportunitiesParams,
  OpportunitiesResponse,
  OpportunityDetail,
} from './types';

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

const getAdminOpportunityDetailUrl = (id: string) => `/opportunities/${id}`;

const getApproveOpportunityUrl = (id: string) => `/opportunities/${id}/approve`;

export const opportunitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOpportunities: builder.query<OpportunitiesResponse, void>({
      query: () => '/operator/opportunities',
      providesTags: ['Opportunities'],
    }),
    getOpportunityDetail: builder.query<OpportunityDetail, string>({
      query: (id) => `/operator/opportunities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Opportunities', id }],
    }),
    getAdminOpportunities: builder.query<
      AdminOpportunitiesResponse,
      ListAdminOpportunitiesParams | undefined
    >({
      query: (params) => getListAdminOpportunitiesUrl(params),
      providesTags: ['Opportunities'],
    }),
    getAdminOpportunityDetail: builder.query<AdminOpportunityDetail, string>({
      query: (id) => getAdminOpportunityDetailUrl(id),
      providesTags: (_result, _error, id) => [{ type: 'Opportunities', id }],
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
  }),
});

export const {
  useGetOpportunitiesQuery,
  useGetOpportunityDetailQuery,
  useGetAdminOpportunitiesQuery,
  useGetAdminOpportunityDetailQuery,
  useCreateOpportunityMutation,
  useRequestApprovalMutation,
  useApproveOpportunityMutation,
} = opportunitiesApi;
