import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  redirectToken?: string;
  token?: string;
  deviceId?: string;
  savedAt?: number;
}

const initialState: AuthState = {};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (
      state,
      action: PayloadAction<{
        redirectToken: string;
        token: string;
        deviceId?: string;
      }>,
    ) => {
      state.redirectToken = action.payload.redirectToken;
      state.token = action.payload.token;
      state.deviceId = action.payload.deviceId;
      state.savedAt = Date.now();
    },
    clearToken: (state) => {
      state.token = undefined;
      state.savedAt = undefined;
      state.deviceId = undefined;
      state.redirectToken = undefined;
    },
  },
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;
