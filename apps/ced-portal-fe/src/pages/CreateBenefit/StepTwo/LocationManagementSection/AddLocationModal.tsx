import { Button } from '@mui/material';
import { AppModal } from '../../../../components';
import { useLocationSubmit } from '../../../../features/location/hooks';
import type { Location } from '../../../../features/location/types';
import { LocationContactsSection } from './LocationContactsSection';
import { LocationFields } from './LocationFields';
import { useState } from 'react';

interface AddLocationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newLocation?: Location) => void;
  onBack?: () => void;
  existingLocations?: Location[];
  attempted?: boolean;
}

export function AddLocationModal({
  open,
  onClose,
  onConfirm,
  onBack,
  existingLocations = [],
}: AddLocationModalProps) {
  const [attempted, setAttempted] = useState(false);
  const { handleConfirm, handleClose, isLoading } = useLocationSubmit(
    onConfirm,
    onClose,
    setAttempted,
  );

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      onBack={onBack}
      title="Aggiungi nuova sede"
      description="Le informazioni saranno visibili su IO nel dettaglio della sede."
    >
      <LocationFields
        existingLocations={existingLocations}
        attempted={attempted}
      />

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
