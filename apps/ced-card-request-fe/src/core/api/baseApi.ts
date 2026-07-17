import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { selectToken } from '../auth/authSelectors';
import type { RootState } from '../store';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = selectToken(getState() as RootState);

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        const acceptLanguage = 'it';
        headers.set('Accept-Language', acceptLanguage);
      }

      return headers;
    },
  }),
  tagTypes: ['Session', 'ReadOnly'],
  endpoints: () => ({}),
});
