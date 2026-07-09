import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { Box, Button, useTheme } from '@mui/material';
import {
  Body,
  ErrorBody,
  MobileSpinnerLoader,
  Title,
  VSpacer,
} from '@pagopa/io-core-ui';
import imageCompression from 'browser-image-compression';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { MarkdownRenderer } from '../../../../components/Typography/MarkdownRender';
import { StepCard } from '../../StepCard';
import type { StepRef } from '../../types';
import { PhotoGuidelinesModal } from './PhotoGuidelinesModal';

type UploadState = 'idle' | 'loading' | 'preview';

interface PhotoUploadProps {
  onPhotoPreviewChange?: (url: string) => void;
}

const markdownContent = `L'immagine deve:
- essere nitida e ben illuminata;
- mostrare bene il tuo volto;
- avere sfondo neutro.
`;

const TARGET_WIDTH = 381;
const TARGET_HEIGHT = 507;

const processCenterCrop = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      const canvas = document.createElement('canvas');
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Impossibile inizializzare il contesto Canvas 2D'));
        return;
      }

      const sourceAspectRatio = img.width / img.height;
      const targetAspectRatio = TARGET_WIDTH / TARGET_HEIGHT;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      if (sourceAspectRatio > targetAspectRatio) {
        sourceWidth = img.height * targetAspectRatio;
        sourceX = (img.width - sourceWidth) / 2;
      } else if (sourceAspectRatio < targetAspectRatio) {
        sourceHeight = img.width / targetAspectRatio;
        sourceY = (img.height - sourceHeight) / 2;
      }

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        TARGET_WIDTH,
        TARGET_HEIGHT,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], 'processed_user_photo.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(croppedFile);
          } else {
            reject(
              new Error('Errore durante la generazione del Blob dal Canvas'),
            );
          }
        },
        'image/jpeg',
        0.85,
      );
    };

    img.onerror = () => {
      reject(
        new Error("Errore durante il caricamento dell'immagine in memoria"),
      );
    };
  });
};

export const PhotoUploadStep = forwardRef<StepRef, PhotoUploadProps>(
  function PhotoUploadStep({ onPhotoPreviewChange }, ref) {
    const theme = useTheme();
    const [photo, setPhoto] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [guidelinesOpen, setGuidelinesOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      validate() {
        if (!photo) {
          setError(true);
          return false;
        }
        return true;
      },
    }));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(false);
      setUploadState('loading');

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError(true);
        setUploadState('idle');
        return;
      }

      try {
        const compressionOptions = {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        const compressedBaseFile = await imageCompression(
          file,
          compressionOptions,
        );

        const finalProcessedFile = await processCenterCrop(compressedBaseFile);
        const imgVerifica = new Image();
        imgVerifica.src = URL.createObjectURL(finalProcessedFile);

        imgVerifica.onload = () => {
          //TODO | START ----------------------------------------------------
          //TODO | TEST-PURPOSE | POP-UP VISIBILE per verificare le dimensioni e il peso dell'immagine elaborata | rimuovere in produzione
          alert(
            `[FOTO ELABORATA]\n` +
              `Risoluzione: ${imgVerifica.width} x ${imgVerifica.height} px\n` +
              `Peso: ${(finalProcessedFile.size / 1024).toFixed(2)} KB\n` +
              `Formato: ${finalProcessedFile.type}`,
          );

          URL.revokeObjectURL(imgVerifica.src);
        };
        //TODO | END ---------------------------------------------------------

        const url = URL.createObjectURL(finalProcessedFile);

        setPhoto(finalProcessedFile);
        setPreview(url);
        onPhotoPreviewChange?.(url);
        setUploadState('preview');
      } catch (err) {
        console.error("Errore durante l'elaborazione dell'immagine:", err);
        setError(true);
        setUploadState('idle');
      }
    };

    const handleChangePhoto = () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPhoto(null);
      setPreview(null);
      onPhotoPreviewChange?.('');
      setUploadState('idle');
    };

    if (uploadState === 'loading') {
      return (
        <MobileSpinnerLoader
          fullscreen
          title="Stiamo caricando la foto"
          description="Attendi qualche secondo"
        />
      );
    }

    if (uploadState === 'preview' && preview) {
      return (
        <StepCard>
          <Title variant="SM" text="Ecco un'anteprima della foto" />
          <VSpacer />
          <Body>Verrà stampata sulla tua carta.</Body>

          <Box
            sx={{
              backgroundColor: '#E8EBF1',
              mt: 3,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              component="img"
              src={preview}
              alt="Anteprima foto"
              sx={{
                width: 148,
                aspectRatio: '3/4',
                borderRadius: 1,
                // objectFit: 'cover',
              }}
            />
            <Button
              variant="text"
              onClick={handleChangePhoto}
              sx={{
                color: theme.palette.common.primaryButton,
                fontSize: 17,
                fontWeight: 600,
              }}
            >
              Cambia foto
            </Button>
          </Box>
        </StepCard>
      );
    }

    return (
      <StepCard>
        <Title
          variant="SM"
          text="Scatta o carica dalla libreria una tua foto in primo piano"
        />
        <VSpacer />
        <MarkdownRenderer content={markdownContent} />
        <VSpacer size={4} />
        <Body asLink onClick={() => setGuidelinesOpen(true)}>
          Leggi le indicazioni complete
        </Body>

        <PhotoGuidelinesModal
          open={guidelinesOpen}
          onClose={() => setGuidelinesOpen(false)}
        />

        <Box
          sx={{
            backgroundColor: 'rgb(109,139,238, 0.08)',
            mt: 3,
            border: `2px dashed ${error ? theme.palette.error.main : theme.palette.common.primaryButton}`,
            borderRadius: 2,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <FileUploadOutlinedIcon
            sx={{ fontSize: 32, color: theme.palette.common.neutralBlack }}
          />
          <Body fontWeight="Semibold">Aggiungi una foto</Body>
          <Button
            variant="contained"
            component="label"
            sx={{
              bgcolor: theme.palette.common.primaryButton,
              textTransform: 'none',
              px: 3,
            }}
          >
            Aggiungi
            <input
              type="file"
              accept="image/jpeg, image/jpg, image/png"
              hidden
              onChange={handleFileChange}
            />
          </Button>
        </Box>

        {error && <ErrorBody fontSize="14px">{error}</ErrorBody>}
      </StepCard>
    );
  },
);
