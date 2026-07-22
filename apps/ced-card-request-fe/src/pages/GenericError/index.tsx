import { PriorityHigh } from '@mui/icons-material';
import { Box, Button, useTheme } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';

interface Props {
  onClose?: () => void;
}

//TODO should use the DS error screen in the future
export default function GenericError({ onClose }: Props) {
  const theme = useTheme();

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
        <Title variant="MD" text="Errore generico" />
        <VSpacer size={8} />
        <Body>Generic error</Body>
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
