import { useEffect, useState } from 'react';
import { loadBase64Image } from '../utils/base64Image';

type Base64ImageState = {
  src?: string;
  error?: Error;
};

export const useBase64Image = (url?: string) => {
  const [image, setImage] = useState<Base64ImageState>();

  useEffect(() => {
    if (!url) {
      setImage(undefined);
      return;
    }

    const controller = new AbortController();
    setImage(undefined);

    const loadImage = async () => {
      try {
        const src = await loadBase64Image(url, controller.signal);
        if (!controller.signal.aborted) {
          setImage({ src });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setImage({
            error:
              error instanceof Error
                ? error
                : new Error('Failed to load Base64 image'),
          });
        }
      }
    };

    void loadImage();
    return () => controller.abort();
  }, [url]);

  return image;
};
