import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const isFetchBaseQueryError = (
  error: FetchBaseQueryError | SerializedError | undefined,
) =>
  error !== undefined && 'status' in error && typeof error.status === 'number';
