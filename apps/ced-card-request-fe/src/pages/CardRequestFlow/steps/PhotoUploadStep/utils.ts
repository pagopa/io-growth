import imageCompression from 'browser-image-compression';

export const ALLOWED_PHOTO_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const;

export type AllowedPhotoType = (typeof ALLOWED_PHOTO_TYPES)[number];

export const isAllowedPhotoType = (type: string): type is AllowedPhotoType =>
  ALLOWED_PHOTO_TYPES.includes(type as AllowedPhotoType);

export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
} as const;

export const compressPhotoFile = (file: File): Promise<File> =>
  imageCompression(file, IMAGE_COMPRESSION_OPTIONS);

const TARGET_WIDTH = 381;
const TARGET_HEIGHT = 507;

export const processCenterCrop = async (file: File): Promise<File> => {
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
        
        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
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
          'processed_user_photo.jpg',
          {
            type: 'image/jpeg',
            lastModified: Date.now(),
          },
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

    worker.postMessage(
      {
        bitmap: imageBitmap,
        targetWidth: TARGET_WIDTH,
        targetHeight: TARGET_HEIGHT,
      },
      [imageBitmap],
    );
  });
};
