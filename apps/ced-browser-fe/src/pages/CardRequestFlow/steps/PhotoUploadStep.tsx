import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Link,
  Typography,
  useTheme,
} from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import type { StepRef } from '../types';

type UploadState = 'idle' | 'loading' | 'preview';

export const PhotoUploadStep = forwardRef<StepRef>(
  function PhotoUploadStep(_, ref) {
    const theme = useTheme();
    const [photo, setPhoto] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>('idle');

    const showLoadingAndResolve = () =>
      new Promise<boolean>((resolve) => {
        setUploadState('loading');
        setTimeout(() => resolve(true), 2000);
      });

    useImperativeHandle(ref, () => ({
      validate() {
        if (!photo) {
          setError(true);
          return false;
        }
        if (uploadState === 'preview') {
          return showLoadingAndResolve();
        }
        return true;
      },
    }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
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
      setUploadState('idle');
    };

    if (uploadState === 'loading') {
      return (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            bgcolor: theme.palette.common.neutralGray,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <CircularProgress
            size={64}
            sx={{ color: theme.palette.common.primaryButton }}
          />
          <Typography
            variant="h3"
            component="p"
            sx={{ color: theme.palette.common.neutralBlack, mt: 2 }}
          >
            Stiamo caricando la foto
          </Typography>
          <Typography
            sx={{
              color: theme.palette.common.neutralDarkGray,
              fontSize: 17,
            }}
          >
            Attendi qualche secondo
          </Typography>
        </Box>
      );
    }

    if (uploadState === 'preview' && preview) {
      return (
        <>
          <Typography
            variant="h3"
            component="h3"
            sx={{ color: theme.palette.common.neutralBlack }}
          >
            Ecco un&apos;anteprima della foto
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: theme.palette.common.neutralDarkGray,
              fontSize: 17,
              lineHeight: 1.45,
            }}
          >
            Verrà stampata sulla tua carta.
          </Typography>

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
        </>
      );
    }

    return (
      <>
        <Typography
          variant="h3"
          component="h3"
          sx={{
            color: theme.palette.common.neutralBlack,
          }}
        >
          Scatta o carica dalla libreria una tua foto in primo piano
        </Typography>

        <Typography
          sx={{
            mt: 2,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
          }}
        >
          L&apos;immagine deve:
        </Typography>

        <Box
          component="ul"
          sx={{
            mt: 1,
            pl: 2.5,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.8,
          }}
        >
          <li>essere nitida e ben illuminata;</li>
          <li>mostrare bene il tuo volto;</li>
          <li>avere sfondo neutro.</li>
        </Box>

        <Link
          href="#"
          underline="always"
          sx={{
            display: 'inline-block',
            mt: 1.5,
            color: theme.palette.common.primaryButton,
            fontSize: 17,
            fontWeight: 600,
          }}
        >
          Leggi le indicazioni complete
        </Link>

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
            sx={{ fontSize: 32, color: theme.palette.common.neutralDarkGray }}
          />

          <Typography
            sx={{
              color: theme.palette.common.neutralBlack,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Aggiungi una foto
          </Typography>

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
          <Typography
            sx={{
              mt: 1,
              color: theme.palette.error.main,
              fontSize: 14,
            }}
          >
            *Devi caricare una foto per continuare
          </Typography>
        )}
      </>
    );
  },
);
