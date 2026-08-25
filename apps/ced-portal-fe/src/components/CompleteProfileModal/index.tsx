import { Box, Button } from '@mui/material';
import { AppModal } from '../Modal';

interface CompleteProfileModalProps {
  open: boolean;
  onClose: () => void;
  onCompleteData: () => void;
}

export function CompleteProfileModal({
  open,
  onClose,
  onCompleteData,
}: Readonly<CompleteProfileModalProps>) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Vuoi Davvero uscire?"
      description="È necessario completare i dati dell'ente per iniziare a pubblicare opportunità."
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        <Button variant="outlined" color="primary" onClick={onClose}>
          Non ora
        </Button>
        <Button variant="contained" color="primary" onClick={onCompleteData}>
          Completa i dati
        </Button>
      </Box>
    </AppModal>
  );
}
