import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { Box, Button, useTheme } from '@mui/material';
import {
  Body,
  ErrorBody,
  MobileSpinnerLoader,
  Title,
  VSpacer,
} from '@pagopa/io-core-ui';
import { MIButton } from '@pagopa/mui-italia';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { MarkdownRenderer } from '../../../../components/Typography/MarkdownRender';
import { StepCard } from '../../StepCard';
import type { StepRef } from '../../types';
import { PhotoGuidelinesModal } from './PhotoGuidelinesModal';
import { isAllowedPhotoType, processInpsPhoto } from './utils';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import {
  selectB64Photo,
  selectPhotoPreview,
  resetPhoto,
  setFile,
  setPreview,
} from '../../../../features/photo-upload/reducer';

type UploadState = 'idle' | 'loading' | 'preview';

interface PhotoUploadProps {
  onPhotoPreviewChange?: (url: string) => void;
}

const markdownContent = `L'immagine deve:
- essere nitida e ben illuminata;
- mostrare bene il tuo volto;
- avere sfondo neutro.
`;

const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Clean = result.split(',')[1];
      resolve(base64Clean);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const PhotoUploadStep = forwardRef<StepRef, PhotoUploadProps>(
  function PhotoUploadStep({ onPhotoPreviewChange }, ref) {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const [photo, setPhoto] = useState<File | null>(null);
    const [error, setError] = useState<string>('');
    const [guidelinesOpen, setGuidelinesOpen] = useState(false);

    const photoBase64 = useAppSelector(selectB64Photo);
    const preview = useAppSelector(selectPhotoPreview);
    const [uploadState, setUploadState] = useState<UploadState>(
      preview ? 'preview' : 'idle',
    );

    useImperativeHandle(ref, () => ({
      validate() {
        if (!photo && !photoBase64) {
          setError('È necessario caricare una foto per procedere');
          return false;
        }
        return true;
      },
    }));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError('');

      if (!isAllowedPhotoType(file.type)) {
        setError('Formato file non valido. Carica un file JPG, JPEG o PNG.');
        return;
      }

      setUploadState('loading');

      try {
        const finalProcessedFile = await processInpsPhoto(file);

        const imgVerify = new Image();
        imgVerify.src = URL.createObjectURL(finalProcessedFile);

        imgVerify.onload = () => {
          URL.revokeObjectURL(imgVerify.src);
        };

        imgVerify.onerror = () => {
          URL.revokeObjectURL(imgVerify.src);
        };

        const url = URL.createObjectURL(finalProcessedFile);

        setPhoto(finalProcessedFile);
        dispatch(setPreview(url));
        onPhotoPreviewChange?.(url);
        const photoB64 = await fileToBase64(finalProcessedFile);
        dispatch(setFile(photoB64));
        setUploadState('preview');
      } catch (err) {
        console.error("Errore durante l'elaborazione dell'immagine:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Si è verificato un errore durante l'elaborazione della foto.";

        setError(errorMessage);
        setUploadState('idle');
      }
    };

    const handleChangePhoto = () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPhoto(null);
      dispatch(resetPhoto());
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
        <MIButton variant="text" onClick={() => setGuidelinesOpen(true)}>
          Leggi le indicazioni complete
        </MIButton>

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
