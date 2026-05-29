import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

interface SavedDraftDialogProps {
  onClose: () => void;
  onResume: () => void;
}

export function SavedDraftDialog({ onClose, onResume }: SavedDraftDialogProps) {
  const theme = useTheme();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setSaved(true), 2000);
    return () => clearTimeout(id);
  }, []);

  if (!saved) {
    return (
      <Box
        sx={{
          minHeight: '100dvh',
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
          Stiamo salvando la bozza
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

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: theme.palette.common.neutralGray,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: 'rgba(109,139,238,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckRoundedIcon
          sx={{ fontSize: 32, color: theme.palette.common.primaryButton }}
        />
      </Box>

      <Typography
        variant="h2"
        component="h2"
        textAlign="center"
        sx={{ mt: 3, color: theme.palette.common.neutralBlack }}
      >
        Abbiamo salvato una bozza della tua richiesta
      </Typography>

      <Typography
        textAlign="center"
        sx={{
          mt: 2,
          color: theme.palette.common.neutralDarkGray,
          fontSize: 17,
          lineHeight: 1.45,
        }}
      >
        Torna più tardi e riparti da dove avevi lasciato.
      </Typography>

      <Button
        fullWidth
        variant="contained"
        onClick={onClose}
        sx={{
          mt: 4,
          height: 52,
          borderRadius: '10px',
          bgcolor: theme.palette.common.primaryButton,
        }}
      >
        Ok, chiudi
      </Button>

      <Button
        fullWidth
        variant="text"
        onClick={onResume}
        sx={{
          mt: 1,
          color: theme.palette.common.primaryButton,
        }}
      >
        Riprendi la richiesta
      </Button>
    </Box>
  );
}
