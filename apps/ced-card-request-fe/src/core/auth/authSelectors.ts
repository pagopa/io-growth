import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

const EXPIRE_TIME = 30 * 60 * 1000;

export const selectToken = (state: RootState) => state.auth.token;

const selectSavedAt = ({ auth }: RootState) => auth?.savedAt;

const selectRedirectToken = ({ auth }: RootState) => auth?.redirectToken;

// const selectDeviceId = ({ auth }: RootState) => auth?.deviceId;

export const selectIsTokenValid = createSelector(
  selectToken,
  selectSavedAt,
  (token, savedAt) =>
    Boolean(token && savedAt && Date.now() - savedAt < EXPIRE_TIME),
);

export const selectCachedSession = createSelector(
  selectToken,
  selectRedirectToken,
  (token, redirectToken) => ({ token, redirectToken }),
);

export const selectIsAuthenticated = createSelector(
  selectIsTokenValid,
  (isValid) => isValid,
);
