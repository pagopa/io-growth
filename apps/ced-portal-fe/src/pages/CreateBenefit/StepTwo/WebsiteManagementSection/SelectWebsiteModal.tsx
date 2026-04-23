import LanguageIcon from '@mui/icons-material/Language';
import type { Website } from '../../../../features/website/types';
import { SelectItemModal } from '../components/SelectItemModal';

interface SelectWebsiteModalProps {
  open: boolean;
  websites: Website[];
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
  onClose: () => void;
  onAddNew: () => void;
  onConfirm: (ids: string[]) => void;
}

export function SelectWebsiteModal({
  open,
  websites,
  selected,
  onSelectedChange,
  onClose,
  onAddNew,
  onConfirm,
}: SelectWebsiteModalProps) {
  return (
    <SelectItemModal
      open={open}
      items={websites}
      selected={selected}
      onSelectedChange={onSelectedChange}
      onClose={onClose}
      onAddNew={onAddNew}
      onConfirm={onConfirm}
      title="I tuoi siti web"
      description="Se non è presente nell'elenco, aggiungi un nuovo sito web."
      label="Seleziona uno o più siti web"
      addNewLabel="Aggiungi nuovo sito web"
      icon={
        <LanguageIcon sx={{ fontSize: 16, color: 'common.decorativeIcon' }} />
      }
      getSubtitle={(site) => site.url}
    />
  );
}
