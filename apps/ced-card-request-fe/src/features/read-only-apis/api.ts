import { baseApi } from '../../core/api/baseApi';
import {
  DraftDataResponse,
  StateResponse,
} from '../../core/api/generated/model';

export const readOnlyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStatus: builder.query<StateResponse, void>({
      query: () => '/api/status',
    }),
    getDraft: builder.query<DraftDataResponse, void>({
      query: () => '/api/draft',
      providesTags: ['ReadOnly'],
    }),
    getDetails: builder.query<DraftDataResponse, void>({
      query: () => '/api/details',
      providesTags: ['ReadOnly'],
    }),
    getSummary: builder.query<DraftDataResponse, void>({
      query: () => '/api/summary',
      providesTags: ['ReadOnly'],
    }),
    getReceipt: builder.query<DraftDataResponse, void>({
      query: () => '/api/receipt',
      providesTags: ['ReadOnly'],
    }),
  }),
});

export const {
  useGetDraftQuery,
  useGetDetailsQuery,
  useGetSummaryQuery,
  useGetReceiptQuery,
  useLazyGetStatusQuery,
} = readOnlyApi;
