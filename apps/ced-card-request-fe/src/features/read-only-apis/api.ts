import { baseApi } from '../../core/api/baseApi';
import {
  DraftDataResponse,
  StateResponse,
} from '../../core/api/generated/model';

const readOnlyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStatus: builder.query<StateResponse, void>({
      query: () => '/status',
    }),
    getDraft: builder.query<DraftDataResponse, void>({
      query: () => '/draft',
      providesTags: ['ReadOnly'],
    }),
    getDetails: builder.query<DraftDataResponse, void>({
      query: () => '/details',
      providesTags: ['ReadOnly'],
    }),
    getSummary: builder.query<DraftDataResponse, void>({
      query: () => '/summary',
      providesTags: ['ReadOnly'],
    }),
    getReceipt: builder.query<DraftDataResponse, void>({
      query: () => '/receipt',
      providesTags: ['ReadOnly'],
    }),
  }),
});

export const { useLazyGetStatusQuery } = readOnlyApi;
