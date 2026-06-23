import { baseApi } from '../../core/api/baseApi';
import type { SessionPayload } from './types';

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSession: builder.query<SessionPayload, string>({
      query: (id) => `/authorize?id=${encodeURIComponent(id)}`,
      providesTags: ['Session'],
    }),
  }),
});

export const { useLazyGetSessionQuery } = sessionApi;
