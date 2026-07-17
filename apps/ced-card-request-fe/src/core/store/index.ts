import storage from 'redux-persist/lib/storage';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import { authReducer } from '../auth/authSlice';
import { persistReducer, persistStore } from 'redux-persist';
import { requestFormReducer } from '../../features/request-form/reducer';
import { confirmRequestFormReducer } from '../../features/confirmation/reducer';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['token', 'savedAt', 'redirectToken', 'deviceId'],
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    request: requestFormReducer,
    confirmation: confirmRequestFormReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/FLUSH',
          'persist/REGISTER',
        ],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
