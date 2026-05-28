import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';

interface PhotoGuidelinesDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const PhotoGuidelinesDrawer = ({
  open,
  onClose,
}: PhotoGuidelinesDrawerProps) => {
  const theme = useTheme();

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          p: 3,
          maxHeight: '90vh',
          overflowY: 'auto',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
          Rispetta tutti i requisiti obbligatori per la foto
        </Typography>
        <IconButton aria-label="Chiudi" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        component="ul"
        sx={{
          pl: 2.5,
          mt: 2,
          color: theme.palette.common.neutralDarkGray,
          fontSize: 17,
          lineHeight: 2,
        }}
      >
        <li>
          Inquadra il tuo viso, in modo che sia visibile per intero, al centro e
          con espressione neutra
        </li>
        <li>
          Non coprire il volto con oggetti, come caschi, mascherine o cappelli.
          Puoi tenere gli ausili sanitari necessari, come occhiali da vista o
          protesi
        </li>
        <li>Usa uno sfondo chiaro, uniforme e neutro</li>
        <li>Assicurati che la foto sia nitida e ben illuminata, senza ombre</li>
      </Box>

      <Typography sx={{ mt: 3, fontSize: 17 }}>
        Ecco un esempio di foto accettata:
      </Typography>

      <Box
        component="img"
        src="/accepted_photo_example.png"
        alt="Esempio foto accettata"
        sx={{
          mt: 2,
          width: 120,
          borderRadius: 1,
        }}
      />

      <Button
        onClick={onClose}
        variant="contained"
        sx={{
          mt: 4,
          borderRadius: 1,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1rem',
        }}
      >
        Ho capito
      </Button>
    </Drawer>
  );
};
