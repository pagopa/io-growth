import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthUser } from './types';

const initialState: AuthState = {
  token: null,
  user: null,
  deviceId: null,
};

interface CredentialsPayload {
  token: string;
  user: AuthUser;
  deviceId: string | null;
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<CredentialsPayload>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.deviceId = action.payload.deviceId;
    },
    clearSession: (state) => {
      state.token = null;
      state.user = null;
      state.deviceId = null;
    },
  },
});

export const { setCredentials, clearSession } = authSlice.actions;
export const authReducer = authSlice.reducer;
