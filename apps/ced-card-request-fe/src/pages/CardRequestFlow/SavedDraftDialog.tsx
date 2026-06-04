import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Box, Button, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { SpinnerLoader } from '../../components/Loader';
import { Body, Title } from '../../components/Typography';
import { VSpacer } from '../../layouts/Spacer';

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
      <VSpacer size={8} />

      <Box sx={{ maxWidth: 270, textAlign: 'center' }}>
        <Title
          text="Abbiamo salvato una bozza della tua richiesta"
          variant="MD"
        />
        <VSpacer size={8} />
        <Body>Torna più tardi e riparti da dove avevi lasciato.</Body>
      </Box>
      <VSpacer size={32} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          size="medium"
          onClick={onClose}
          sx={{
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
            color: theme.palette.common.primaryButton,
          }}
        >
          Riprendi la richiesta
        </Button>
      </Box>
    </Box>
  );
}
