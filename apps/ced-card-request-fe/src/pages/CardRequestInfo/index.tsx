import { Box, Button, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { MarkdownRenderer } from '../../components/Typography/MarkdownRender';

const REQUEST_CARD_URL = 'https://www.google.com/';
const CATEGORIES_URL = REQUEST_CARD_URL;
const INFO_URL = REQUEST_CARD_URL;
const PRIVACY_URL = REQUEST_CARD_URL;
const TERMS_URL = REQUEST_CARD_URL;

export default function CardRequestInfoPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleContinue = () => navigate(APP_ROUTES.CONSENT);

  const markdownContent = `
  ## Carta Europea della Disabilità: cos’è e come funziona\n
  La Carta Europea della Disabilità è il documento che permette alle persone con disabilità di accedere a diverse opportunità su beni e servizi, pubblici o privati, in Italia e in Europa.
  \nLa richiesta della carta è **gratuita** e non ci sono **limiti di utilizzo**.
  \n![alt](https://placehold.co/600x268/AAEEEF/AAEEEF)
  ##### Chi può richiederla?
  Le persone con disabilita in possesso di un documento ufficiale che attesti la propria condizione.
  \n[Consulta le categorie di aventi diritto](${CATEGORIES_URL}).
  \n
  ##### Cosa serve
  Ti basta premere su "Richiedi la Carta" e in pochi passaggi puoi inviare la richiesta all'INPS.
  \nTi servirà **una foto in primo piano** e potrebbe esserti richiesto anche il **documento che attesta l'invalidita**.
  \nDopo il rilascio, potrai anche aggiungere la versione digitale della carta al Portafoglio.
  ![alt](https://placehold.co/600x268/AAEEEF/AAEEEF)
  ##### Come si usa
  **Nei punti di accesso fisici e online** dei partner, mostra la tua carta per usufruire delle opportunità su trasporti, spettacoli, attività culturali e molto altro.
  \nPer saperne di più, [vai al sito della Carta Europea della Disabilità](${INFO_URL}).
  \n
  ^^Continuando dichiari di aver letto e compreso [l’Informativa sul trattamento dei dati personali](${PRIVACY_URL}) e i [Termini e condizioni](${TERMS_URL}) del servizio.^^
  `;

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
      <Box
        sx={{
          px: 3,
          pt: 4,
          pb: 'calc(200px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <MarkdownRenderer content={markdownContent} />
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
          pb: 'calc(12px + env(safe-area-inset-bottom, 0px))',
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
