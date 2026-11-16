export const isNetworkError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR');

export const getHttpStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }

  if (typeof error.status === 'number') return error.status;
  if (
    error.status === 'PARSING_ERROR' &&
    'originalStatus' in error &&
    typeof error.originalStatus === 'number'
  ) {
    return error.originalStatus;
  }

  return undefined;
};
