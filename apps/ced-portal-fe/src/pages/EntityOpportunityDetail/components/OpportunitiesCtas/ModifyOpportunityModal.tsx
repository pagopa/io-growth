import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

interface ModifyOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ModifyOpportunityModal({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: Readonly<ModifyOpportunityModalProps>) {
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

        <Stack
          spacing={3}
          alignItems="flex-start"
          textAlign="left"
          sx={{ mb: 2 }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Vuoi modificare l&apos;opportunità?
          </Typography>

          <Typography sx={{ color: 'text.secondary', fontSize: 16 }}>
            Potrebbe essere richiesta un&apos;approvazione del Dipartimento
            prima di tornare visibile su IO.
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
