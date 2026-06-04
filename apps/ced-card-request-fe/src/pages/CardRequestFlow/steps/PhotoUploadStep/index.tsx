import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { Box, Button, useTheme } from '@mui/material';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { SpinnerLoader } from '../../../../components/Loader';
import { Body, ErrorBody, Title } from '../../../../components/Typography';
import { MarkdownRenderer } from '../../../../components/Typography/MarkdownRender';
import { VSpacer } from '../../../../layouts/Spacer';
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
        if (uploadState === 'preview') {
          setUploadState('loading');
          return new Promise<boolean>((resolve) => {
            setTimeout(() => {
              resolve(true);
            }, 2000);
          });
        }
        return true;
      },
    }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setPhoto(file);
        setPreview(url);
        onPhotoPreviewChange?.(url);
        setError(false);
        setUploadState('loading');
        setTimeout(() => {
          setUploadState('preview');
        }, 2000);
      }
    };

    const handleChangePhoto = () => {
      setPhoto(null);
      setPreview(null);
      onPhotoPreviewChange?.('');
      setUploadState('idle');
    };

    if (uploadState === 'loading') {
      return (
        <SpinnerLoader
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
            Aggiungi{' '}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </Button>
        </Box>

        {error && (
          <ErrorBody fontSize="14px">
            *Devi caricare una foto per continuare
          </ErrorBody>
        )}
      </StepCard>
    );
  },
);
