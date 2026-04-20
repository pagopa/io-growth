import type { DataTableColumn } from '../../../../components/DataTable/types';
import type { Location } from '../../../../features/location/types';
import { ItemDataTable } from '../components/ItemDataTable';

const columns: DataTableColumn<Location>[] = [
  { id: 'name', label: 'Nome', renderCell: (item) => item.name },
  { id: 'address', label: 'Indirizzo', renderCell: (item) => item.address },
];

interface LocationListProps {
  locations: Location[];
  onRemove: (id: string) => void;
}

export function LocationList({ locations, onRemove }: LocationListProps) {
  return <ItemDataTable items={locations} columns={columns} onRemove={onRemove} />;
}
