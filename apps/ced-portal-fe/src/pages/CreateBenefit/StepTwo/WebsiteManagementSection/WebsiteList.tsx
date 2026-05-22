import type { DataTableColumn } from '../../../../components/DataTable/types';
import type { OnlinePlace } from '../../../../features/places/types';
import { ItemDataTable } from '../components/ItemDataTable';

const columns: DataTableColumn<OnlinePlace>[] = [
  { id: 'name', label: 'Nome', renderCell: (item) => item.name },
  { id: 'url', label: 'URL', renderCell: (item) => item.website.url },
];

interface WebsiteListProps {
  websites: OnlinePlace[];
  onRemove: (id: string) => void;
}

export function WebsiteList({ websites, onRemove }: WebsiteListProps) {
  return (
    <ItemDataTable items={websites} columns={columns} onRemove={onRemove} />
  );
}
