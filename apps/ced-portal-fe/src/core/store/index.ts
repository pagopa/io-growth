import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import { authReducer } from '../auth/authSlice';
import { wizardReducer } from '../../features/wizard/slice';
import { locationReducer } from '../../features/location/locationSlice';
import { websiteReducer } from '../../features/website/websiteSlice';
import { agreementDetailCreationReducer } from '../../features/agreementDetailCreation/agreementDetailCreationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wizard: wizardReducer,
    location: locationReducer,
    website: websiteReducer,
    agreementDetailCreation: agreementDetailCreationReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
