import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../api/baseApi';
import { authReducer } from '../auth/authSlice';
import { agreementDetailCreationReducer } from '../../features/agreementDetailCreation/agreementDetailCreationSlice';
import { locationReducer } from '../../features/location/locationSlice';
import { websiteReducer } from '../../features/website/websiteSlice';
import { wizardReducer } from '../../features/wizard/slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    agreementDetailCreation: agreementDetailCreationReducer,
    location: locationReducer,
    website: websiteReducer,
    wizard: wizardReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
