import CheckIcon from '@mui/icons-material/Check';
import { Box, Button, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { Body, LabelCaption, Title } from '../../components/Typography';
import { MarkdownRenderer } from '../../components/Typography/MarkdownRender';
import { VSpacer } from '../../layouts/Spacer';

const PRIVACY_URL = 'https://www.google.com/';

export default function CardRequestConsentPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleContinue = () => {
    navigate(APP_ROUTES.LOADING);
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
        <Title text="Ci dai il tuo consenso?" variant="LG" />
        <VSpacer />
        <Body>
          Per poter richiedere la Carta Europa della Disabilita abbiamo bisogno
          di fornire alcuni tuoi dati all&apos;INPS.
        </Body>

        <VSpacer />
        <LabelCaption>Dati necessari</LabelCaption>
        <VSpacer />
        <Box
          sx={{
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Body fontWeight="Semibold">Codice fiscale</Body>
          <CheckIcon sx={{ color: '#2B2E38', fontSize: 20 }} />
        </Box>
        <VSpacer />
        <MarkdownRenderer
          content={`^^Per maggiori informazioni, leggi l'[Informativa sulla Privacy](${PRIVACY_URL})^^`}
        />
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
