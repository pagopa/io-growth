import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { confirmRequestFormReducer } from '../../features/confirmation/reducer';
import { photoReducer } from '../../features/photo-upload/reducer';
import { requestFormReducer } from '../../features/request-form/reducer';
import { statusReducer } from '../../features/status/reducer';
import { baseApi } from '../api/baseApi';
import { authReducer } from '../auth/authSlice';

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
    status: statusReducer,
    photo: photoReducer,
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
