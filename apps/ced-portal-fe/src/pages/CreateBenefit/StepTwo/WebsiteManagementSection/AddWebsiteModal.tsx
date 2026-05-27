import { useState } from 'react';
import { Button } from '@mui/material';
import { AppModal } from '../../../../components';
import type { PlaceResponse } from '../../../../core/api/generated/model';
import { useWebsiteSubmit } from '../../../../features/website/hooks';
import { WebsiteContactsSection } from './WebsiteContactsSection';
import { WebsiteFields } from './WebsiteFields';

interface AddWebsiteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newWebsite?: PlaceResponse) => void;
  onBack?: () => void;
}

export function AddWebsiteModal({
  open,
  onClose,
  onConfirm,
  onBack,
}: AddWebsiteModalProps) {
  const [attempted, setAttempted] = useState(false);
  const { handleConfirm, handleClose, isLoading } = useWebsiteSubmit(
    onConfirm,
    onClose,
    setAttempted,
  );

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      onBack={onBack}
      title="Aggiungi nuovo sito web"
      description="Le informazioni saranno visibili su IO nel dettaglio del sito web."
    >
      <WebsiteFields attempted={attempted} />

      <WebsiteContactsSection />

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
