import type { DataTableColumn } from '../../../../components/DataTable/types';
import type { Website } from '../../../../features/website/types';
import { ItemDataTable } from '../components/ItemDataTable';

const columns: DataTableColumn<Website>[] = [
  { id: 'name', label: 'Nome', renderCell: (item) => item.name },
  { id: 'url', label: 'URL', renderCell: (item) => item.url },
];

interface WebsiteListProps {
  websites: Website[];
  onRemove: (id: string) => void;
}

export function WebsiteList({ websites, onRemove }: WebsiteListProps) {
  return (
    <ItemDataTable items={websites} columns={columns} onRemove={onRemove} />
  );
}
