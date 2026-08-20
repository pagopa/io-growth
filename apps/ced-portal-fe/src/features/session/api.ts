import { baseApi } from '../../core/api/baseApi';
import type { AuthorizeResponse } from '../../core/api/generated/model';

const sessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSession: builder.query<AuthorizeResponse, string>({
      query: (id) => `/authorize?id=${encodeURIComponent(id)}`,
      providesTags: ['Session'],
    }),
  }),
});

export const { useLazyGetSessionQuery } = sessionApi;
