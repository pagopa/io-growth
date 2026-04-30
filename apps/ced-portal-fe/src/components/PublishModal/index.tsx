import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: () => void;
  count: number;
  publishDate?: string;
}

export function PublishModal({
  open,
  onClose,
  onPublish,
  count,
  publishDate,
}: Readonly<PublishModalProps>) {
  const isSingle = count === 1;

  const description = isSingle
    ? `L'opportunità sarà disponibile su IO a partire dal ${publishDate ?? '{gg/mm/aaaa}'}. Invieremo un'email di conferma all'ente.`
    : `Le opportunità selezionate (${count}) saranno disponibili su IO a partire dalla data indicata nel dettaglio. Invieremo un'email di conferma agli enti.`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3, p: 0 } }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          <CloseIcon />
        </IconButton>

        <Stack spacing={3} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#D6DEFF',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <CheckIcon sx={{ color: '#4A6AE5', fontSize: 32 }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Pubblica su IO
          </Typography>

          <Typography sx={{ color: 'text.secondary', fontSize: 16, px: 2 }}>
            {description}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onPublish}
            sx={{ fontWeight: 700, borderRadius: 2, px: 5 }}
          >
            Pubblica
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
