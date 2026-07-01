import { Check, ContentCopy } from '@mui/icons-material';
import { Box, Button, useTheme } from '@mui/material';
import { Title, VSpacer } from '@pagopa/io-core-ui';
import { useState } from 'react';
import { MarkdownRenderer } from '../../components/Typography/MarkdownRender';
import { copyTextToClipboard } from '../../utils';

interface Props {
  requestNumber?: string;
}

export default function SubmissionSuccess({ requestNumber }: Readonly<Props>) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const onClose = () => window.location.replace('iossoapi://cancel');

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

  const markdownContent = `Riceverai un messaggio su IO con gli aggiornamenti sulla tua richiesta.
Per identificare la tua richiesta in caso di problemi, salva questo codice:
Numero Domus: **${number}**.`;

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

        <Title variant="MD" text="Richiesta inviata!" />
        <VSpacer size={8} />
        <MarkdownRenderer content={markdownContent} />
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
            size="medium"
            variant="contained"
            onClick={handleCopy}
            startIcon={<ContentCopy />}
            sx={{
              bgcolor: theme.palette.common.primaryButton,
              textTransform: 'none',
              borderRadius: 2,
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
    </Box>
  );
}
