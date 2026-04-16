import { Button } from '@mui/material';
import { AppModal } from '../../../../components';
import { useLocationSubmit } from '../../../../features/location/hooks';
import type { Location } from '../../../../features/location/types';
import { LocationContactsSection } from './LocationContactsSection';
import { LocationFields } from './LocationFields';

interface AddLocationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newLocation?: Location) => void;
  onBack?: () => void;
  existingLocations?: Location[];
}

export function AddLocationModal({
  open,
  onClose,
  onConfirm,
  onBack,
  existingLocations = [],
}: AddLocationModalProps) {
  const { handleConfirm, handleClose, isLoading } = useLocationSubmit(onConfirm, onClose);

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      onBack={onBack}
      title="Aggiungi nuova sede"
      description="Le informazioni saranno visibili su IO nel dettaglio della sede."
    >
      <LocationFields existingLocations={existingLocations} />

      <LocationContactsSection />

      <Button
        variant="contained"
        fullWidth
        disabled={isLoading}
        onClick={handleConfirm}
        sx={{ textTransform: 'none', py: 1.5 }}
      >
        {isLoading ? 'Salvataggio...' : 'Conferma'}
      </Button>
    </AppModal>
  );
}
