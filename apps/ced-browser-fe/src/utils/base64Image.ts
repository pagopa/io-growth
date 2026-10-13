const getImageMimeType = (base64: string, contentType: string | null) => {
  const responseMimeType = contentType?.split(';')[0].trim();
  if (responseMimeType?.startsWith('image/')) {
    return responseMimeType;
  }

  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  if (base64.startsWith('UklGR')) return 'image/webp';

  return undefined;
};

const toImageDataUrl = (value: string, contentType: string | null) => {
  const trimmedValue = value.trim();
  if (trimmedValue.startsWith('data:image/')) {
    return trimmedValue;
  }

  const base64 = trimmedValue.replace(/\s/g, '');
  const mimeType = getImageMimeType(base64, contentType);

  if (!mimeType) {
    throw new Error('Unsupported or invalid Base64 image response');
  }

  return `data:${mimeType};base64,${base64}`;
};

export const loadBase64Image = async (
  url: string,
  signal?: AbortSignal,
): Promise<string> => {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Image request failed with status ${response.status}`);
  }

  return toImageDataUrl(
    await response.text(),
    response.headers.get('content-type'),
  );
};
