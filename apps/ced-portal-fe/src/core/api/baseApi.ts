import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { selectToken } from '../auth/authSelectors';
import type { RootState } from '../store';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = selectToken(getState() as RootState);

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: [
    'Session',
    'Dashboard',
    'Benefits',
    'Places',
    'Opportunities',
    'Entities',
    'Profile',
  ],
  endpoints: () => ({}),
});

export const hasStatus = (error: unknown, status: number): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as FetchBaseQueryError).status === status
  );
};
