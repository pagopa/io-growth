import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Box, Button, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { SpinnerLoader } from '../../components/Loader';
import { Body, Title } from '../../components/Typography';

interface SavedDraftDialogProps {
  onClose: () => void;
  onResume: () => void;
}

export function SavedDraftDialog({
  onClose,
  onResume,
}: Readonly<SavedDraftDialogProps>) {
  const theme = useTheme();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setSaved(true), 2000);
    return () => clearTimeout(id);
  }, []);

  if (!saved) {
    return (
      <SpinnerLoader
        title="Stiamo salvando la bozza"
        description="Attendi qualche secondo"
      />
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

      <Title
        text="Abbiamo salvato una bozza della tua richiesta"
        variant="SM"
      />
      <Body>Torna più tardi e riparti da dove avevi lasciato.</Body>

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
