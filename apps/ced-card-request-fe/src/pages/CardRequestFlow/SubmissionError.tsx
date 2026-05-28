import { Box, Button, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { PriorityHigh } from '@mui/icons-material';

interface Props {
  onRetry?: () => void;
  onClose?: () => void;
}

export default function SubmissionError({ onRetry, onClose }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleRetry = useCallback(() => {
    if (onRetry) return onRetry();
    // default fallback: go back one step
    navigate(-1);
  }, [onRetry, navigate]);

  const handleClose = () => {
    if (onClose) return onClose();
    navigate(-1);
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

        <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, fontSize: 24 }}>
          Non è stato possibile salvare i dati
        </Typography>

        <Typography
          sx={{
            color: theme.palette.common.neutralDarkGray,
            textAlign: 'center',
            mb: 3,
            fontSize: 16,
            lineHeight: 1.5,
          }}
        >
          Se il problema persiste, riprova in un secondo momento.
        </Typography>

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
