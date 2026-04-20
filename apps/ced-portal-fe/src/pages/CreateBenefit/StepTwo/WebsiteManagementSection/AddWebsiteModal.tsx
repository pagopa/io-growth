import { Button } from '@mui/material';
import { AppModal } from '../../../../components';
import { useWebsiteSubmit } from '../../../../features/website/hooks';
import type { Website } from '../../../../features/website/types';
import { WebsiteContactsSection } from './WebsiteContactsSection';
import { WebsiteFields } from './WebsiteFields';

interface AddWebsiteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newWebsite?: Website) => void;
  onBack?: () => void;
}

export function AddWebsiteModal({
  open,
  onClose,
  onConfirm,
  onBack,
}: AddWebsiteModalProps) {
  const { handleConfirm, handleClose, isLoading } = useWebsiteSubmit(
    onConfirm,
    onClose,
  );

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      onBack={onBack}
      title="Aggiungi nuovo sito web"
      description="Le informazioni saranno visibili su IO nel dettaglio del sito web."
    >
      <WebsiteFields />

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
