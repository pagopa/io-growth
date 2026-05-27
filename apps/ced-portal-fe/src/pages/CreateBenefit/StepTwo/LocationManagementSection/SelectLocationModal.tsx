import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { OfflinePlaceResponse } from '../../../../core/api/generated/model';
import { SelectItemModal } from '../components/SelectItemModal';

interface SelectLocationModalProps {
  open: boolean;
  locations: OfflinePlaceResponse[];
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
  onClose: () => void;
  onAddNew: () => void;
  onConfirm: (ids: string[]) => void;
}

export function SelectLocationModal({
  open,
  locations,
  selected,
  onSelectedChange,
  onClose,
  onAddNew,
  onConfirm,
}: SelectLocationModalProps) {
  return (
    <SelectItemModal
      open={open}
      items={locations}
      selected={selected}
      onSelectedChange={onSelectedChange}
      onClose={onClose}
      onAddNew={onAddNew}
      onConfirm={onConfirm}
      title="Le tue sedi"
      description="Se non è presente nell'elenco, aggiungi una nuova sede."
      label="Seleziona una o più sedi"
      addNewLabel="Aggiungi nuova sede"
      emptySelectionError="Seleziona almeno una sede"
      icon={
        <LocationOnIcon sx={{ fontSize: 16, color: 'common.decorativeIcon' }} />
      }
      getSubtitle={(loc) => loc.address.street}
    />
  );
}
