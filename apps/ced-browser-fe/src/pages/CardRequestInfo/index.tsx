import { Box, Button, Link, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const REQUEST_CARD_URL = 'https://www.google.com/';
const CATEGORIES_URL = REQUEST_CARD_URL;
const INFO_URL = REQUEST_CARD_URL;
const PRIVACY_URL = REQUEST_CARD_URL;
const TERMS_URL = REQUEST_CARD_URL;

export default function CardRequestInfoPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleContinue = () => {
    window.open(REQUEST_CARD_URL, '_blank', 'noopener,noreferrer');
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
          height: 268,
          bgcolor: theme.palette.common.decorativeCyan,
        }}
      />

      <Box sx={{ px: 3, pt: 4, pb: 3 }}>
        <Typography
          component="h1"
          sx={{
            fontSize: 46,
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          Carta Europea della Disabilità: cos’è e come funziona
        </Typography>

        <Typography
          sx={{
            mt: 3,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
          }}
        >
          La Carta Europea della Disabilita e il documento che permette alle
          persone con disabilita di accedere a diverse opportunita su beni e
          servizi, pubblici o privati, in Italia e in Europa.
        </Typography>

        <Typography
          sx={{
            mt: 2,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
          }}
        >
          La richiesta della carta e <Box component="strong">gratuita</Box> e
          non ci sono <Box component="strong">limiti di utilizzo</Box>.
        </Typography>

        <Box
          sx={{
            mt: 4,
            mb: 3,
            height: 150,
            bgcolor: theme.palette.common.decorativeCyan,
          }}
        />

        <Typography component="h2" sx={{ fontSize: 34, fontWeight: 700 }}>
          Chi puo richiederla?
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
          }}
        >
          Le persone con disabilita in possesso di un documento ufficiale che
          attesti la propria condizione.
        </Typography>

        <Link
          href={CATEGORIES_URL}
          target="_blank"
          rel="noreferrer"
          sx={{
            mt: 2,
            display: 'inline-block',
            color: theme.palette.common.primaryButton,
            fontSize: 17,
            fontWeight: 600,
          }}
        >
          Consulta le categorie di aventi diritto
        </Link>

        <Typography
          component="h2"
          sx={{ mt: 3, fontSize: 34, fontWeight: 700 }}
        >
          Cosa serve
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
          }}
        >
          Ti basta premere su &quot;Richiedi la Carta&quot; e in pochi passaggi
          puoi inviare la richiesta all&apos;INPS.
        </Typography>

        <Typography
          sx={{
            mt: 2,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
          }}
        >
          Ti servira <Box component="strong">una tua foto in primo piano</Box>.
          Potrebbe esserti richiesto anche il{' '}
          <Box component="strong">documento che attesta l&apos;invalidita</Box>.
        </Typography>

        <Typography
          sx={{
            mt: 2,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
          }}
        >
          Dopo il rilascio, potrai anche aggiungere la versione digitale della
          carta al Portafoglio.
        </Typography>

        <Box
          sx={{
            mt: 4,
            mb: 3,
            height: 150,
            bgcolor: theme.palette.common.decorativeCyan,
          }}
        />

        <Typography component="h2" sx={{ fontSize: 34, fontWeight: 700 }}>
          Come si usa
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
          }}
        >
          <Box component="strong">Nei punti di accesso fisici e online</Box> dei
          partner, mostra la tua carta per usufruire delle opportunita su
          trasporti, spettacoli, attivita culturali e molto altro.
        </Typography>

        <Typography
          sx={{
            mt: 2,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 17,
            lineHeight: 1.45,
          }}
        >
          Per saperne di piu,{' '}
          <Link
            href={INFO_URL}
            target="_blank"
            rel="noreferrer"
            sx={{
              color: theme.palette.common.primaryButton,
              fontWeight: 600,
            }}
          >
            vai al sito della Carta Europea della Disabilita.
          </Link>
        </Typography>

        <Typography
          sx={{
            mt: 3,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 16,
            lineHeight: 1.45,
            pb: 'calc(140px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          Continuando dichiari di aver letto e compreso l&apos;
          <Link
            href={PRIVACY_URL}
            target="_blank"
            rel="noreferrer"
            sx={{ color: theme.palette.common.primaryButton, fontWeight: 600 }}
          >
            Informativa sul trattamento dei dati personali
          </Link>{' '}
          e i{' '}
          <Link
            href={TERMS_URL}
            target="_blank"
            rel="noreferrer"
            sx={{ color: theme.palette.common.primaryButton, fontWeight: 600 }}
          >
            Termini e condizioni del servizio
          </Link>
          .
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
          boxShadow: '0 -6px 20px rgba(0, 0, 0, 0.08)',
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
            textTransform: 'none',
            fontSize: 22,
            fontWeight: 700,
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
            textTransform: 'none',
            fontSize: 18,
            fontWeight: 600,
            color: theme.palette.common.primaryButton,
          }}
        >
          Annulla
        </Button>
      </Box>
    </Box>
  );
}
