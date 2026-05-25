import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import { authReducer } from '../auth/authSlice';
import type { AuthState } from '../auth/types';
import { wizardReducer } from '../../features/wizard/slice';
import { locationReducer } from '../../features/location/locationSlice';
import { websiteReducer } from '../../features/website/websiteSlice';
import { agreementDetailCreationReducer } from '../../features/agreementDetailCreation/agreementDetailCreationSlice';
import { benefitFiltersReducer } from '../../features/benefitsFilters/benefitFiltersSlice';

const AUTH_STORAGE_KEY = 'ced-portal-auth';

const loadPersistedAuthState = (): AuthState | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const rawAuthState = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawAuthState) {
    return undefined;
  }

  try {
    const parsedState = JSON.parse(rawAuthState) as AuthState;
    if (!parsedState?.token || !parsedState?.user) {
      return undefined;
    }
    return parsedState;
  } catch {
    return undefined;
  }
};

export const store = configureStore({
  preloadedState: {
    auth: loadPersistedAuthState() ?? { token: null, user: null },
  },
  reducer: {
    auth: authReducer,
    wizard: wizardReducer,
    location: locationReducer,
    website: websiteReducer,
    benefitFilters: benefitFiltersReducer,
    agreementDetailCreation: agreementDetailCreationReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

store.subscribe(() => {
  if (typeof window === 'undefined') {
    return;
  }

  const authState = store.getState().auth;
  if (authState.token && authState.user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
