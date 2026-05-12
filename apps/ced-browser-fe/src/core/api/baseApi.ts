import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { selectToken } from '../auth/authSelectors';
import type { RootState } from '../store';

const MOCKOON_API_BASE_URL = 'http://localhost:3001/api';
const MOCKOON_API_BASE_URL_HOST = 'http://192.168.1.223:3001/api';

// MOCKOON_API_BASE_URL_HOST and this function make it easier to call the Mockoon API when testing the app on mobile devices.
const getDynamicBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof window !== 'undefined') {
    if (
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      return MOCKOON_API_BASE_URL_HOST;
    }
  }

  return MOCKOON_API_BASE_URL;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getDynamicBaseUrl(),
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
    'Locations',
    'Websites',
    'Opportunities',
    'Entities',
  ],
  endpoints: () => ({}),
});
