import type { DataTableColumn } from '../../../../components/DataTable/types';
import type { OnlinePlaceResponse } from '../../../../core/api/generated/model';
import { ItemDataTable } from '../components/ItemDataTable';

const columns: DataTableColumn<OnlinePlaceResponse>[] = [
  { id: 'name', label: 'Nome', renderCell: (item) => item.name },
  { id: 'url', label: 'URL', renderCell: (item) => item.website.url },
];

interface WebsiteListProps {
  websites: OnlinePlaceResponse[];
  onRemove: (id: string) => void;
}

export function WebsiteList({ websites, onRemove }: WebsiteListProps) {
  return (
    <ItemDataTable items={websites} columns={columns} onRemove={onRemove} />
  );
}
