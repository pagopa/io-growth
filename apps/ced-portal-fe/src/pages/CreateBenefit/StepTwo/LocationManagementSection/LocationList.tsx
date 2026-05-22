import type { DataTableColumn } from '../../../../components/DataTable/types';
import type { OfflinePlace } from '../../../../features/places/types';
import { ItemDataTable } from '../components/ItemDataTable';

const columns: DataTableColumn<OfflinePlace>[] = [
  { id: 'name', label: 'Nome', renderCell: (item) => item.name },
  {
    id: 'address',
    label: 'Indirizzo',
    renderCell: (item) => item.address.street,
  },
];

interface LocationListProps {
  locations: OfflinePlace[];
  onRemove: (id: string) => void;
}

export function LocationList({ locations, onRemove }: LocationListProps) {
  return (
    <ItemDataTable items={locations} columns={columns} onRemove={onRemove} />
  );
}
