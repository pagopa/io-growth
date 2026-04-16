import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../api/baseApi';
import { authReducer } from '../auth/authSlice';
<<<<<<< HEAD
import { agreementDetailCreationReducer } from '../../features/agreementDetailCreation/agreementDetailCreationSlice';
=======
import { wizardReducer } from '../../features/wizard/slice';
>>>>>>> cebf64c (feat: step 2 access points)

export const store = configureStore({
  reducer: {
    auth: authReducer,
<<<<<<< HEAD
    agreementDetailCreation: agreementDetailCreationReducer,
=======
    wizard: wizardReducer,
>>>>>>> cebf64c (feat: step 2 access points)
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
