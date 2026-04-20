import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../api/baseApi';
import { authReducer } from '../auth/authSlice';
import { wizardReducer } from '../../features/wizard/slice';
import { locationReducer } from '../../features/location/locationSlice';
import { websiteReducer } from '../../features/website/websiteSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wizard: wizardReducer,
    location: locationReducer,
    website: websiteReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
