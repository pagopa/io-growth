const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extractCodes = (value: unknown): number[] | undefined => {
  if (!isRecord(value) || !Array.isArray(value.errors)) return undefined;

  const codes = value.errors.flatMap((entry: unknown) => {
    if (!isRecord(entry)) return [];
    const code = entry.codice ?? entry.Codice;
    if (typeof code === 'number' && Number.isSafeInteger(code)) return [code];
    if (typeof code === 'string' && /^\d+$/.test(code)) {
      const parsed = Number(code);
      if (Number.isSafeInteger(parsed)) return [parsed];
    }
    return [];
  });

  return codes.length > 0 ? codes : undefined;
};

const extractDocumentedCode = (value: Record<string, unknown>) => {
  if (!isRecord(value.error) || !isRecord(value.error.details))
    return undefined;
  const code = value.error.details.errorCode;
  if (typeof code !== 'string' || !/^\d+$/.test(code)) return undefined;
  const parsed = Number(code);
  return Number.isSafeInteger(parsed) ? [parsed] : undefined;
};

const parseEmbeddedErrorCode = (value: string): number[] | undefined => {
  const jsonMatch = value.match(/rejected:\s*(\{.*\})\s*$/s);
  if (!jsonMatch) return undefined;

  try {
    return extractCodes(JSON.parse(jsonMatch[1]));
  } catch {
    console.warn('[getErrorCodes] Unable to parse embedded error payload');
    return undefined;
  }
};

const extractErrorCode = (
  error: Record<string, unknown>,
): number[] | undefined => {
  const directCodes = extractCodes(error);
  if (directCodes) return directCodes;
  const documentedCode = extractDocumentedCode(error);
  if (documentedCode) return documentedCode;
  const detail = error.detail;
  if (detail && typeof detail === 'string') {
    const embeddedCode = parseEmbeddedErrorCode(detail);
    if (embeddedCode !== undefined) return embeddedCode;
  }

  return undefined;
};

export const getErrorCodes = (error: unknown): number[] | undefined => {
  if (!isRecord(error) || !isRecord(error.data)) return undefined;

  return extractErrorCode(error.data);
};
