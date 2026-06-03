import type { RootState } from '../store';

export const selectAuthState = (state: RootState) => state.auth;
export const selectToken = (state: RootState) => selectAuthState(state).token;
export const selectUser = (state: RootState) => selectAuthState(state).user;
export const selectUserRole = (state: RootState) => selectUser(state)?.role;
export const selectDeviceId = (state: RootState) =>
  selectAuthState(state).deviceId;
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(selectToken(state));
