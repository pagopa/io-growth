import type { DataTableColumn } from '../../../../components/DataTable/types';
import type { OfflinePlaceResponse } from '../../../../core/api/generated/model';
import { ItemDataTable } from '../components/ItemDataTable';

const columns: DataTableColumn<OfflinePlaceResponse>[] = [
  { id: 'name', label: 'Nome', renderCell: (item) => item.name },
  {
    id: 'address',
    label: 'Indirizzo',
    renderCell: (item) => item.address.street,
  },
];

interface LocationListProps {
  locations: OfflinePlaceResponse[];
  onRemove: (id: string) => void;
}

export function LocationList({ locations, onRemove }: LocationListProps) {
  return (
    <ItemDataTable items={locations} columns={columns} onRemove={onRemove} />
  );
}
