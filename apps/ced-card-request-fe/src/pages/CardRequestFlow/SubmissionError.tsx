import { PriorityHigh } from '@mui/icons-material';
import { Box, Button, useTheme } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { useCallback } from 'react';

interface Props {
  onRetry?: () => void;
  onClose?: () => void;
}

export default function SubmissionError({ onRetry, onClose }: Props) {
  const theme = useTheme();

  const handleRetry = useCallback(() => {
    if (onRetry) return onRetry();
    // default fallback: go back one step
  }, [onRetry]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
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
        <Title variant="MD" text="Non è stato possibile salvare i dati" />
        <VSpacer size={8} />
        <Body>Se il problema persiste, riprova in un secondo momento.</Body>
        <VSpacer size={32} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Button
            variant="contained"
            onClick={handleRetry}
            sx={{
              bgcolor: theme.palette.common.primaryButton,
              textTransform: 'none',
              px: 6,
              py: 1.25,
              borderRadius: 2,
            }}
          >
            Riprova
          </Button>

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
  );
}
