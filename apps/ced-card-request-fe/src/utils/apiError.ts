export const isNetworkError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR');
