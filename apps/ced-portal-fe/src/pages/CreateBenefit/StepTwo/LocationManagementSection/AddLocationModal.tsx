import { Button } from '@mui/material';
import { AppModal } from '../../../../components';
import type { PlaceResponse } from '../../../../core/api/generated/model';
import { useLocationSubmit } from '../../../../features/location/hooks';
import { LocationContactsSection } from './LocationContactsSection';
import { LocationFields } from './LocationFields';
import { useState } from 'react';

interface AddLocationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newLocation?: PlaceResponse) => void;
  onBack?: () => void;
}

export function AddLocationModal({
  open,
  onClose,
  onConfirm,
  onBack,
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
      description="Le informazioni saranno visibili su IO nel dettaglio del punto di accesso."
    >
      <LocationFields attempted={attempted} />

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
