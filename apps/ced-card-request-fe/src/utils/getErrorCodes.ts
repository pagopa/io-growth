import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseEmbeddedErrorCode = (value: string): number[] | undefined => {
  const jsonMatch = value.match(/rejected:\s*(\{.*\})\s*$/s);
  if (!jsonMatch) return undefined;

  try {
    const parsed = JSON.parse(jsonMatch[1]);

    if (Array.isArray(parsed?.errors)) {
      const codes = parsed.errors.map(
        (entry: { codice: string | number; descrizione: string }) =>
          isRecord(entry) ? entry.codice : undefined,
      );

      return codes;
    }
  } catch (error) {
    console.warn('[getErrorCodes] Unable to parse embedded error payload', {
      value,
      error,
    });
    return undefined;
  }

  return undefined;
};

const extractErrorCode = (
  error: Record<string, unknown>,
): number[] | undefined => {
  if (!isRecord(error)) return undefined;

  const detail = error?.detail;
  if (detail && typeof detail === 'string') {
    const embeddedCode = parseEmbeddedErrorCode(detail);
    if (embeddedCode !== undefined) return embeddedCode;
  }

  return undefined;
};

export const getErrorCodes = (
  error: FetchBaseQueryError | SerializedError | undefined,
): number[] | undefined => {
  if (!error) return undefined;

  if (!('data' in error) || !isRecord(error.data)) return undefined;

  return extractErrorCode(error.data);
};
