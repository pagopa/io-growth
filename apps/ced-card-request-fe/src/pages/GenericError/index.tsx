import { ArrowBack, Download, PriorityHigh } from '@mui/icons-material';
import { Box, Button, ButtonBase, useTheme } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';

interface Props {
  onClose?: () => void;
  onRetry?: () => void;
  onBack?: () => void;
}

//TODO should use the DS error screen in the future
export default function GenericError({ onClose, onBack, onRetry }: Props) {
  const theme = useTheme();

  /**
   * TODO debug only
   * ----------------------------------------------------------------------------
   */
  const error = localStorage.getItem('log-error');

  const handleDownloadError = () => {
    if (!error) return;

    try {
      const parsedError = JSON.parse(error);
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(parsedError, null, 2));

      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `error-log-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Impossibile scaricare il file di errore', e);
    }
  };
  // --------------------------------------------------------------------------------

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
      {onBack && (
        <ButtonBase
          onClick={onBack}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            color: 'text.primary',
            fontSize: 16,
            fontWeight: 600,
            mb: 3,
          }}
        >
          <ArrowBack sx={{ fontSize: 20 }} />
          Indietro
        </ButtonBase>
      )}
      <Box
        sx={{
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.common.neutralGray,
          p: 2,
          mx: 2,
        }}
      >
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: theme.palette.common.decorativeBlue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              mx: 'auto',
            }}
          >
            <PriorityHigh
              sx={{ color: theme.palette.primary.main, fontSize: 32 }}
            />
          </Box>
          <Title variant="MD" text="Errore generico" />
          <VSpacer size={8} />
          <Body>Generic error</Body>

          {/* START- TODO debug only */}
          {error && (
            <>
              <VSpacer size={16} />
              <ButtonBase
                onClick={handleDownloadError}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: theme.palette.primary.main,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'underline',
                  '&:hover': { opacity: 0.8 },
                }}
              >
                <Download sx={{ fontSize: 16 }} />
                Scarica dettagli errore (JSON)
              </ButtonBase>
            </>
          )}
          {/* END- TODO debug only */}

          <VSpacer size={32} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
            }}
          >
            {onRetry && (
              <Button
                variant="text"
                onClick={onRetry}
                sx={{ color: theme.palette.common.primaryButton, fontSize: 16 }}
              >
                Riprova
              </Button>
            )}
            <Button
              variant="text"
              onClick={handleClose}
              sx={{ color: theme.palette.common.primaryButton, fontSize: 16 }}
            >
              Chiudi
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
