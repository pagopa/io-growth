import { Box, Button, Stack, Typography } from '@mui/material';
import { AppModal } from '../../../../components';

interface InfoModalProps {
  open: boolean;
  type: 'logo' | 'cover' | null;
  onClose: () => void;
}

const MODAL_CONTENT = {
  logo: {
    title: 'Logo dell’ente',
    subtitle: 'Il logo sarà visibile nella pagina del tuo ente sull’app IO.',
    body: 'Carica il tuo logo per aiutare gli utenti a capire chi offre le opportunità e migliorare la riconoscibilità e la fiducia nei tuoi servizi.',
    details: [
      "Usa un'immagine quadrata (rapporto 1:1)",
      'Preferisci uno sfondo bianco o trasparente',
      'Se disponibile, usa la versione compatta del logo (pittogramma)',
    ],
  },
  cover: {
    title: 'Immagine di copertina',
    subtitle:
      'L’immagine di copertina è la foto principale della pagina del tuo ente sull’app IO, visibile nella parte alta dello schermo.',
    body: 'Carica un’immagine di copertina per mettere in risalto la tua pagina e le tue opportunità. Questo aumenta anche le possibilità di comparire tra i risultati di ricerca.',
    details: [
      'Non usare immagini con loghi o testi',
      'Scegli una foto che rappresenti il tuo ente o le sue attività (es. sede, territorio, servizi)',
      "Usa un'immagine di alta qualità",
      'Preferisci un formato orizzontale per una corretta visualizzazione',
    ],
  },
};

export const InfoModal = ({ open, type, onClose }: InfoModalProps) => {
  const content = type ? MODAL_CONTENT[type] : null;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={content?.title || ''}
      description={content?.subtitle}
    >
      <Stack>
        {content && (
          <Stack>
            <Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {content.body}
              </Typography>
            </Stack>
            <Stack mb={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Indicazioni utili:
              </Typography>
              <Box
                component="ul"
                sx={{
                  m: 0,
                  pl: 3,
                  color: 'text.secondary',
                  listStyleType: 'disc',
                  listStylePosition: 'outside',
                }}
              >
                {content.details.map((detail, index) => (
                  <Typography
                    key={index}
                    component="li"
                    variant="body2"
                    color="text.secondary"
                  >
                    {detail}
                  </Typography>
                ))}
              </Box>
            </Stack>
          </Stack>
        )}
        <Button variant="contained" onClick={onClose} sx={{ width: '100%' }}>
          Ho capito
        </Button>
      </Stack>
    </AppModal>
  );
};
