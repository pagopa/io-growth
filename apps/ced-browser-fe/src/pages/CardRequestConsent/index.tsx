import CheckIcon from '@mui/icons-material/Check';
import { Box, Button, Link, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';

const PRIVACY_URL = 'https://www.google.com/';

export default function CardRequestConsentPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleContinue = () => {
    navigate(APP_ROUTES.CARD_REQUEST_LOADING);
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: theme.palette.common.neutralGray,
      }}
    >
      <Box
        sx={{
          px: 3,
          pt: 4,
          pb: 3,
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            color: theme.palette.common.neutralBlack,
          }}
        >
          Ci dai il tuo consenso?
        </Typography>

        <Typography
          sx={{
            mt: 2,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
          }}
        >
          Per poter richiedere la Carta Europa della Disabilita abbiamo bisogno
          di fornire alcuni tuoi dati all&apos;INPS.
        </Typography>

        <Typography
          sx={{
            mt: 5,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 14,
            lineHeight: '100%',
            letterSpacing: '0px',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          Dati necessari
        </Typography>

        <Box
          sx={{
            mt: 2,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            sx={{
              color: theme.palette.common.neutralBlack,
              fontSize: 16,
              lineHeight: '22px',
              letterSpacing: '0px',
              fontWeight: 600,
            }}
          >
            Codice fiscale
          </Typography>
          <CheckIcon sx={{ color: '#2B2E38', fontSize: 24 }} />
        </Box>

        <Typography
          sx={{
            mt: 3,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
            pb: 'calc(140px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          Per maggiori informazioni, leggi l{' '}
          <Link
            href={PRIVACY_URL}
            target="_blank"
            rel="noreferrer"
            sx={{ color: theme.palette.common.primaryButton, fontWeight: 600 }}
          >
            Informativa sulla Privacy
          </Link>
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          bgcolor: theme.palette.common.neutralGray,
          borderTop: `1px solid ${theme.palette.divider}`,
          maxWidth: '100%',
          px: 3,
          pt: 2,
          pb: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Button
          fullWidth
          variant="contained"
          onClick={handleContinue}
          sx={{
            height: 52,
            borderRadius: '10px',
            bgcolor: theme.palette.common.primaryButton,
          }}
        >
          Continua
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate(-1)}
          sx={{
            mt: 1,
            color: theme.palette.common.primaryButton,
          }}
        >
          Annulla
        </Button>
      </Box>
    </Box>
  );
}
