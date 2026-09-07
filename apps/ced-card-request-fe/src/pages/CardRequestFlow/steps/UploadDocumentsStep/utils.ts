export const DOCUMENT_VALIDATION = {
  allowedExtensions: ['.pdf', '.jpg'],
  maxSizeInMB: 2,
} as const;

export type FileValidationResult = {
  isValid: boolean;
  message?: string;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== 'string') {
        reject(new Error('Impossibile leggere il file selezionato.'));
        return;
      }

      const base64Payload = result.includes(',')
        ? result.split(',')[1]
        : result;
      resolve(base64Payload);
    };

    reader.onerror = () => {
      reject(new Error('Errore durante la lettura del file.'));
    };
  });
};

export const validateDocumentFile = (
  file: File | null | undefined,
  maxSizeInMB = DOCUMENT_VALIDATION.maxSizeInMB,
): FileValidationResult => {
  if (!file) {
    return {
      isValid: false,
      message: 'Nessun file selezionato.',
    };
  }

  const fileName = file.name.toLowerCase();
  const extension = fileName.includes('.')
    ? fileName.slice(fileName.lastIndexOf('.'))
    : '';

  const isValidExtension = DOCUMENT_VALIDATION.allowedExtensions.some(
    (allowedExtension) => allowedExtension === extension,
  );

  if (!isValidExtension) {
    return {
      isValid: false,
      message: 'Formato non valido. Carica un file PDF o JPG.',
    };
  }

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      message: `Il file supera la dimensione massima di ${maxSizeInMB} MB.`,
    };
  }

  return {
    isValid: true,
  };
};

export const validateBase64DocumentSize = (
  base64Content: string,
  maxSizeInMB = DOCUMENT_VALIDATION.maxSizeInMB,
): FileValidationResult => {
  if (!base64Content) {
    return {
      isValid: false,
      message: 'Il contenuto base64 del file è vuoto.',
    };
  }

  const normalizedContent = base64Content.includes(',')
    ? base64Content.split(',')[1]
    : base64Content;

  try {
    const decodedLength = atob(normalizedContent).length;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (decodedLength > maxSizeInBytes) {
      return {
        isValid: false,
        message: `Il file codificato supera la dimensione massima di ${maxSizeInMB} MB.`,
      };
    }

    return {
      isValid: true,
    };
  } catch {
    return {
      isValid: false,
      message: 'Il contenuto base64 non è valido.',
    };
  }
};
