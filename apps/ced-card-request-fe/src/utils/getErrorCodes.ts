type ErrorDetails = {
  errorCode?: string | number | Array<string | number>;
};

type ErrorResponseData = {
  error?: {
    details?: ErrorDetails;
  };
};

type ErrorWithData = {
  data?: ErrorResponseData;
};

export const getErrorCodes = (
  error: unknown,
): number | number[] | undefined => {
  if (!error || typeof error !== 'object' || !('data' in error)) {
    return undefined;
  }

  const details = (error as ErrorWithData).data?.error?.details;
  const errorCode = details?.errorCode;

  if (typeof errorCode === 'number') {
    return errorCode;
  }

  if (Array.isArray(errorCode)) {
    const numericErrorCodes = errorCode.filter(
      (code): code is number =>
        typeof code === 'number' ||
        (typeof code === 'string' && /^\d+$/.test(code)),
    );

    return numericErrorCodes.length > 0
      ? numericErrorCodes.map((code) => Number(code))
      : undefined;
  }

  if (typeof errorCode === 'string') {
    const numericErrorCodes = errorCode
      .split(',')
      .map((code) => code.trim())
      .filter((code) => /^\d+$/.test(code))
      .map(Number);

    if (numericErrorCodes.length === 1) {
      return numericErrorCodes[0];
    }

    if (numericErrorCodes.length > 1) {
      return numericErrorCodes;
    }
  }

  return undefined;
};
