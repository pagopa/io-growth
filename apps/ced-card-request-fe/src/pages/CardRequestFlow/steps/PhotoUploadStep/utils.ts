import imageCompression from 'browser-image-compression';

export const ALLOWED_PHOTO_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const;

export type AllowedPhotoType = (typeof ALLOWED_PHOTO_TYPES)[number];

export const isAllowedPhotoType = (type: string): type is AllowedPhotoType =>
  ALLOWED_PHOTO_TYPES.includes(type as AllowedPhotoType);

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MIN_WIDTH = 381;
const MIN_HEIGHT = 507;
const TARGET_RATIO = MIN_HEIGHT / MIN_WIDTH; // ~1.33
const RATIO_TOLERANCE = 0.1;

export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: MAX_FILE_SIZE_MB,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
} as const;

//TODO - debug only --- LOGGER CONFIGURATION ---
const LOG_STORAGE_KEY = 'photo_processor_logs';
const MAX_STORED_LOGS = 50;

// TODO debug only
const logProcessor = (
  message: string,
  level: 'info' | 'warn' | 'error' = 'info',
) => {
  try {
    const logEntry = `[${level.toUpperCase()}] ${message}`;

    const existingLogsStr = localStorage.getItem(LOG_STORAGE_KEY);
    let logs: string[] = [];
    if (existingLogsStr) {
      logs = JSON.parse(existingLogsStr);
    }

    logs.push(logEntry);

    if (logs.length > MAX_STORED_LOGS) {
      logs = logs.slice(logs.length - MAX_STORED_LOGS);
    }

    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('Impossibile salvare i log nel localStorage', e);
  }
};
//TODO -----------------------------

const getImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      reject(new Error("Impossibile leggere le dimensioni dell'immagine"));
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
};

const JFIF_IDENTIFIER = [0x4a, 0x46, 0x49, 0x46, 0x00];
const JFIF_DPI = 72;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const PNG_PHYS_CHUNK_TYPE = [0x70, 0x48, 0x59, 0x73];

const findJfifIdentifier = (bytes: Uint8Array): number => {
  for (let index = 0; index <= bytes.length - JFIF_IDENTIFIER.length; index++) {
    if (
      JFIF_IDENTIFIER.every(
        (identifierByte, offset) => bytes[index + offset] === identifierByte,
      )
    ) {
      return index;
    }
  }

  return -1;
};

export const setJpegDensityDpi = async (
  file: File,
  dpi = JFIF_DPI,
): Promise<File> => {
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error('Il file compresso non è un JPEG valido.');
  }

  const jfifIdentifierIndex = findJfifIdentifier(bytes);
  let outputBytes = bytes;

  if (jfifIdentifierIndex >= 0) {
    outputBytes = bytes.slice();
    outputBytes[jfifIdentifierIndex + 7] = 1;
    outputBytes[jfifIdentifierIndex + 8] = dpi >> 8;
    outputBytes[jfifIdentifierIndex + 9] = dpi & 0xff;
    outputBytes[jfifIdentifierIndex + 10] = dpi >> 8;
    outputBytes[jfifIdentifierIndex + 11] = dpi & 0xff;
  } else {
    const jfifHeader = new Uint8Array([
      0xff,
      0xe0,
      0x00,
      0x10,
      ...JFIF_IDENTIFIER,
      0x01,
      0x01,
      0x01,
      dpi >> 8,
      dpi & 0xff,
      dpi >> 8,
      dpi & 0xff,
      0x00,
      0x00,
    ]);
    outputBytes = new Uint8Array(bytes.length + jfifHeader.length);
    outputBytes.set(bytes.subarray(0, 2));
    outputBytes.set(jfifHeader, 2);
    outputBytes.set(bytes.subarray(2), 2 + jfifHeader.length);
  }

  return new File([outputBytes], file.name, {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  });
};

const writeUint32 = (bytes: Uint8Array, offset: number, value: number) => {
  bytes[offset] = (value >>> 24) & 0xff;
  bytes[offset + 1] = (value >>> 16) & 0xff;
  bytes[offset + 2] = (value >>> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
};

const readUint32 = (bytes: Uint8Array, offset: number): number =>
  ((bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]) >>>
  0;

const calculateCrc32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
};

const createPngDensityChunk = (dpi: number): Uint8Array => {
  const pixelsPerMeter = Math.round(dpi / 0.0254);
  const chunk = new Uint8Array(21);

  writeUint32(chunk, 0, 9);
  chunk.set(PNG_PHYS_CHUNK_TYPE, 4);
  writeUint32(chunk, 8, pixelsPerMeter);
  writeUint32(chunk, 12, pixelsPerMeter);
  chunk[16] = 1;
  writeUint32(chunk, 17, calculateCrc32(chunk.subarray(4, 17)));

  return chunk;
};

const isPng = (bytes: Uint8Array): boolean =>
  PNG_SIGNATURE.every((signatureByte, index) => bytes[index] === signatureByte);

export const setPngDensityDpi = async (
  file: File,
  dpi = JFIF_DPI,
): Promise<File> => {
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (!isPng(bytes)) {
    throw new Error('Il file elaborato non è un PNG valido.');
  }

  const densityChunk = createPngDensityChunk(dpi);
  let chunkOffset = PNG_SIGNATURE.length;
  let insertionOffset = -1;
  let existingDensityChunkLength = 0;

  while (chunkOffset + 12 <= bytes.length) {
    const dataLength = readUint32(bytes, chunkOffset);
    const totalChunkLength = dataLength + 12;
    const chunkTypeOffset = chunkOffset + 4;

    if (
      PNG_PHYS_CHUNK_TYPE.every(
        (chunkTypeByte, index) =>
          bytes[chunkTypeOffset + index] === chunkTypeByte,
      )
    ) {
      insertionOffset = chunkOffset;
      existingDensityChunkLength = totalChunkLength;
      break;
    }

    if (
      bytes[chunkTypeOffset] === 0x49 &&
      bytes[chunkTypeOffset + 1] === 0x48 &&
      bytes[chunkTypeOffset + 2] === 0x44 &&
      bytes[chunkTypeOffset + 3] === 0x52
    ) {
      insertionOffset = chunkOffset + totalChunkLength;
    }

    chunkOffset += totalChunkLength;
  }

  if (insertionOffset < 0) {
    throw new Error('Il file PNG non contiene un chunk IHDR valido.');
  }

  const outputBytes = new Uint8Array(
    bytes.length + densityChunk.length - existingDensityChunkLength,
  );
  outputBytes.set(bytes.subarray(0, insertionOffset));
  outputBytes.set(densityChunk, insertionOffset);
  outputBytes.set(
    bytes.subarray(insertionOffset + existingDensityChunkLength),
    insertionOffset + densityChunk.length,
  );

  return new File([outputBytes], file.name, {
    type: 'image/png',
    lastModified: file.lastModified,
  });
};

export const compressPhotoFile = (file: File): Promise<File> =>
  imageCompression(file, IMAGE_COMPRESSION_OPTIONS);

export const processCenterCrop = async (
  file: File,
  targetWidth: number,
  targetHeight: number,
): Promise<File> => {
  logProcessor(
    `[PhotoProcessor] ✂️ Inizio processCenterCrop. Target: ${targetWidth}x${targetHeight}`,
  );
  const imageBitmap = await createImageBitmap(file);

  const workerCode = `
    self.onmessage = async (e) => {
      const { bitmap, targetWidth, targetHeight } = e.data;
      
      try {
        const canvas = new OffscreenCanvas(targetWidth, targetHeight);
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Impossibile inizializzare il contesto OffscreenCanvas 2D');
        }
        
        const sourceAspectRatio = bitmap.width / bitmap.height;
        const targetAspectRatio = targetWidth / targetHeight;
        
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = bitmap.width;
        let sourceHeight = bitmap.height;
        
        if (sourceAspectRatio > targetAspectRatio) {
          sourceWidth = bitmap.height * targetAspectRatio;
          sourceX = (bitmap.width - sourceWidth) / 2;
        } else if (sourceAspectRatio < targetAspectRatio) {
          sourceHeight = bitmap.width / targetAspectRatio;
          sourceY = (bitmap.height - sourceHeight) / 2;
        }
        
        ctx.drawImage(
          bitmap,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, targetWidth, targetHeight
        );
        
        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.90 });
        bitmap.close();
        
        self.postMessage({ success: true, blob });
      } catch (error) {
        bitmap.close();
        self.postMessage({ success: false, error: error.message });
      }
    };
  `;

  return new Promise((resolve, reject) => {
    const blobWorker = new Blob([workerCode], {
      type: 'application/javascript',
    });
    const workerURL = URL.createObjectURL(blobWorker);
    const worker = new Worker(workerURL);

    worker.onmessage = (e) => {
      URL.revokeObjectURL(workerURL);
      worker.terminate();

      if (e.data.success) {
        const croppedFile = new File(
          [e.data.blob],
          file.name.replace(/\.[^/.]+$/, '') + '_cropped.jpg',
          { type: 'image/jpeg', lastModified: Date.now() },
        );
        logProcessor(
          `[PhotoProcessor] ✅ processCenterCrop completato. Nuovo peso: ${(croppedFile.size / 1024 / 1024).toFixed(2)} MB`,
        );
        resolve(croppedFile);
      } else {
        reject(new Error(e.data.error));
      }
    };

    worker.onerror = (err) => {
      URL.revokeObjectURL(workerURL);
      worker.terminate();
      reject(err);
    };

    worker.postMessage({ bitmap: imageBitmap, targetWidth, targetHeight }, [
      imageBitmap,
    ]);
  });
};

export const processInpsPhoto = async (file: File): Promise<File> => {
  logProcessor(`\n--- [PhotoProcessor] INIZIO ELABORAZIONE ---`);
  logProcessor(
    `[PhotoProcessor] File: ${file.name} | Tipo: ${file.type} | Peso originario: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
  );

  if (!isAllowedPhotoType(file.type)) {
    logProcessor(
      `[PhotoProcessor] ❌ Errore: Formato non supportato (${file.type})`,
      'error',
    );
    throw new Error('Formato file non supportato. Usa JPEG, JPG o PNG.');
  }

  logProcessor(`[PhotoProcessor] Lettura dimensioni in corso...`);
  const { width: L, height: H } = await getImageDimensions(file);
  logProcessor(
    `[PhotoProcessor] 📏 Dimensioni originali: Larghezza (L)=${L}px, Altezza (H)=${H}px`,
  );

  if (H < MIN_HEIGHT || L < MIN_WIDTH) {
    logProcessor(
      `[PhotoProcessor] ❌ Errore: Dimensioni minime non rispettate. Minimo: ${MIN_WIDTH}x${MIN_HEIGHT}`,
      'error',
    );
    throw new Error(
      `Immagine troppo piccola. Dimensioni minime richieste: ${MIN_WIDTH}x${MIN_HEIGHT} pixel.`,
    );
  }

  const currentRatio = H / L;
  const minAllowedRatio = TARGET_RATIO - RATIO_TOLERANCE; // ~1.23
  const maxAllowedRatio = TARGET_RATIO + RATIO_TOLERANCE; // ~1.43

  logProcessor(
    `[PhotoProcessor] 🧮 Rapporto attuale (H/L): ${currentRatio.toFixed(3)} (Range accettato: ${minAllowedRatio.toFixed(2)} - ${maxAllowedRatio.toFixed(2)})`,
  );

  let processedFile = file;

  if (currentRatio < minAllowedRatio || currentRatio > maxAllowedRatio) {
    logProcessor(
      `[PhotoProcessor] ⚠️ Rapporto fuori tolleranza. Avvio calcolo per Crop Dinamico...`,
      'warn',
    );
    let newWidth = L;
    let newHeight = H;

    if (currentRatio > maxAllowedRatio) {
      newHeight = Math.round(L * TARGET_RATIO);
      logProcessor(
        `[PhotoProcessor] Immagine troppo "alta". Si taglierà in altezza -> Nuova altezza: ${newHeight}px`,
      );
    } else {
      newWidth = Math.round(H / TARGET_RATIO);
      logProcessor(
        `[PhotoProcessor] Immagine troppo "larga". Si taglierà in larghezza -> Nuova larghezza: ${newWidth}px`,
      );
    }

    processedFile = await processCenterCrop(processedFile, newWidth, newHeight);
  } else {
    logProcessor(`[PhotoProcessor] ✔️ Rapporto corretto, NO CROP necessario.`);
  }

  logProcessor(
    `[PhotoProcessor] Controllo peso: ${(processedFile.size / 1024 / 1024).toFixed(2)} MB vs MAX ${MAX_FILE_SIZE_MB} MB`,
  );
  if (processedFile.size > MAX_FILE_SIZE_BYTES) {
    logProcessor(
      `[PhotoProcessor] ⚠️ Peso eccessivo. Avvio Compressione...`,
      'warn',
    );
    processedFile = await compressPhotoFile(processedFile);
    logProcessor(
      `[PhotoProcessor] ✅ Compressione completata. Nuovo peso: ${(processedFile.size / 1024 / 1024).toFixed(2)} MB`,
    );
  } else {
    logProcessor(
      `[PhotoProcessor] ✔️ Peso nei limiti, NO COMPRESSIONE necessaria.`,
    );
  }

  logProcessor(`--- [PhotoProcessor] FINE ELABORAZIONE ---\n`);
  return processedFile.type === 'image/jpeg' ||
    processedFile.type === 'image/jpg'
    ? setJpegDensityDpi(processedFile)
    : setPngDensityDpi(processedFile);
};
