import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  isLoading?: boolean;
}

export function TerminateEntityModal({
  open,
  onClose,
  onConfirm,
  entityName,
  isLoading = false,
}: Readonly<Props>) {
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

        <Stack spacing={3} alignItems="left" textAlign="left" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Termina convenzione
          </Typography>

          <Typography sx={{ color: 'text.secondary', fontSize: 16 }}>
            L’ente <strong>{entityName}</strong> non potrà più accedere al
            portale, inoltre tutte le opportunità che ha creato saranno rimosse
            da IO.
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ pt: 2 }}
        >
          <Button
            variant="text"
            onClick={onClose}
            sx={{ fontWeight: 700, borderRadius: 2, px: 5 }}
          >
            Annulla
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onConfirm}
            disabled={isLoading}
            sx={{ fontWeight: 700, borderRadius: 2, px: 5 }}
          >
            {isLoading ? 'Conferma in corso...' : 'Conferma'}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
