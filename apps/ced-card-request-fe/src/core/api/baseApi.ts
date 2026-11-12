import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { selectToken } from '../auth/authSelectors';
import { authActions } from '../auth/authSlice';
import type { RootState } from '../store';

const MOCKOON_API_BASE_URL = 'http://localhost:3001/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || MOCKOON_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = selectToken(getState() as RootState);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const requestToken = selectToken(api.getState() as RootState);
    const result = await rawBaseQuery(args, api, extraOptions);
    if (
      result.error?.status === 401 &&
      api.endpoint !== 'getSession' &&
      requestToken === selectToken(api.getState() as RootState)
    ) {
      api.dispatch(authActions.expireSession());
    }
    return result;
  },
  tagTypes: ['Session', 'ReadOnly'],
  endpoints: () => ({}),
});
