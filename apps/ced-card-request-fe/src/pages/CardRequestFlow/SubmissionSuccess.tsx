import { Box, Button, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { Check, ContentCopy } from '@mui/icons-material';
import { copyTextToClipboard } from '../../utils';

interface Props {
  requestNumber?: string;
  onClose?: () => void;
}

export default function SubmissionSuccess({ requestNumber, onClose }: Props) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const number = requestNumber ?? '91238000001184';

  const handleCopy = async () => {
    try {
      const success = await copyTextToClipboard(number);
      if (!success) throw new Error('Copy failed');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

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
          p: { xs: 3, sm: 4 },
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
          <Check
            sx={{ color: theme.palette.common.primaryButton, fontSize: 32 }}
          />
        </Box>

        <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, fontSize: 24 }}>
          Richiesta inviata!
        </Typography>

        <Typography
          sx={{
            color: theme.palette.common.neutralDarkGray,
            textAlign: 'center',
            mb: 2,
            fontSize: 16,
            lineHeight: 1.5,
          }}
        >
          Riceverai un messaggio su IO con gli aggiornamenti sulla tua
          richiesta.
        </Typography>

        <Typography
          sx={{
            color: theme.palette.common.neutralDarkGray,
            textAlign: 'center',
            mb: 1,
            fontSize: 16,
            lineHeight: 1.5,
          }}
        >
          Per identificare la tua richiesta in caso di problemi, salva questo
          codice:
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mb: 3,
          }}
        >
          <Typography sx={{ color: theme.palette.common.neutralDarkGray }}>
            Numero Domus:
          </Typography>
          <Typography sx={{ fontWeight: 600 }}>{number}</Typography>
        </Box>

        <Button
          fullWidth
          size="medium"
          variant="contained"
          onClick={handleCopy}
          startIcon={<ContentCopy />}
          sx={{
            mb: 2,
            bgcolor: theme.palette.common.primaryButton,
            textTransform: 'none',
            borderRadius: 2,
            py: 1.5,
            '& .MuiButton-startIcon': { color: 'inherit' },
          }}
          aria-label="Copia numero domus"
        >
          {copied ? 'Copiato' : 'Copia numero'}
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
  );
}
