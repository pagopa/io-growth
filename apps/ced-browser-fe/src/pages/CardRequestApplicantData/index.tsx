import { Box, Button, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppTextField, Stepper, PageHeader } from '../../components';
import { APP_ROUTES } from '../../app/routeConfig';

export default function CardRequestApplicantDataPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const personalData = [
    { label: 'Nome', value: 'Anna' },
    { label: 'Cognome', value: 'Verdi' },
    { label: 'Sesso', value: 'F' },
    { label: 'Data di nascita', value: '31/03/1995' },
    { label: 'Comune di nascita', value: 'Como' },
    { label: 'Provincia di nascita', value: 'CO' },
    { label: 'Stato di nascita', value: 'Italia' },
    { label: 'Codice Fiscale', value: 'VRDNNA95C71C933I' },
    { label: 'Cittadinanza', value: 'Italiana' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: theme.palette.common.neutralGray,
      }}
    >
      <PageHeader
        title="Richiesta Carta Europea della Disabilita"
        subtitle={
          <Typography
            sx={{
              color: theme.palette.common.neutralDarkGray,
              fontSize: 17,
              lineHeight: 1.45,
              mt: 2,
            }}
          >
            Completa i passaggi e invia la richiesta.
          </Typography>
        }
      />

      <Box sx={{ px: 3, pb: 3 }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{
            mt: 0.5,
            color: theme.palette.common.neutralBlack,
          }}
        >
          Conferma i tuoi dati
        </Typography>

        <Stepper activeStep={0} totalSteps={6} />

        <Box
          sx={{
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            p: 3,
            pb: 4,
          }}
        >
          <Typography
            variant="h3"
            component="h3"
            sx={{
              color: theme.palette.common.neutralBlack,
            }}
          >
            Ecco a chi verra assegnata la carta
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: theme.palette.common.neutralDarkGray,
              fontSize: 17,
              lineHeight: 1.45,
            }}
          >
            Conferma i tuoi dati anagrafici.
          </Typography>

          <Box sx={{ mt: 3, display: 'grid', gap: 2.25 }}>
            {personalData.map((field) => (
              <AppTextField
                disabled
                key={field.label}
                label={field.label}
                value={field.value}
                InputProps={{ readOnly: true }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ pb: 'calc(140px + env(safe-area-inset-bottom, 0px))' }} />
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
          onClick={() => navigate(APP_ROUTES.CARD_REQUEST_FLOW)}
          sx={{
            height: 52,
            borderRadius: '10px',
            bgcolor: theme.palette.common.primaryButton,
          }}
        >
          Conferma
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
