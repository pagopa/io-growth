import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, IconButton, Modal, useTheme } from '@mui/material';
import { Body, Title } from '../../../../components/Typography';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const PhotoGuidelinesModal = ({ open, onClose }: Props) => {
  const theme = useTheme();

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          backgroundColor: theme.palette.common.white,
          borderRadius: 2,
          p: 3,
          overflowY: 'auto',
          maxHeight: '95%',
          width: '90%',
          mx: 'auto',
          mt: '5vh',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Title
            text="Rispetta tutti i requisiti obbligatori per la foto"
            variant="XS"
          />
          <IconButton aria-label="Chiudi" onClick={onClose}>
            <CloseIcon sx={{ color: 'black' }} />
          </IconButton>
        </Box>

        <Box
          component="ul"
          sx={{
            pl: 2.5,
            mt: 2,
            color: theme.palette.common.neutralDarkGray,
            fontSize: 16,
            lineHeight: '22px',
          }}
        >
          <li>
            Inquadra il tuo viso, in modo che sia visibile per intero, al centro
            e con espressione neutra
          </li>
          <li>
            Non coprire il volto con oggetti, come caschi, mascherine o
            cappelli. Puoi tenere gli ausili sanitari necessari, come occhiali
            da vista o protesi
          </li>
          <li>Usa uno sfondo chiaro, uniforme e neutro</li>
          <li>
            Assicurati che la foto sia nitida e ben illuminata, senza ombre
          </li>
        </Box>

        <Body>Ecco un esempio di foto accettata:</Body>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Box
            component="img"
            src="/accepted_photo_example.png"
            alt="Esempio foto accettata"
            sx={{
              mt: 2,
              mb: 2,
              width: 138,
              borderRadius: 1,
            }}
          />

          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            Ho capito
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
