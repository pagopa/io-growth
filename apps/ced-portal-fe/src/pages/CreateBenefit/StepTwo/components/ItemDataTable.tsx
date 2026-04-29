import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { useMemo } from 'react';
import { DataTable } from '../../../../components';
import type {
  DataTableColumn,
  DataTableRowAction,
} from '../../../../components/DataTable/types';

interface IdentifiableItem {
  id: string;
}

interface ItemDataTableProps<T extends IdentifiableItem> {
  items: T[];
  columns: DataTableColumn<T>[];
  onRemove: (id: string) => void;
}

export function ItemDataTable<T extends IdentifiableItem>({
  items,
  columns,
  onRemove,
}: ItemDataTableProps<T>) {
  const rowAction = useMemo<DataTableRowAction<T>>(
    () => ({
      renderAction: (item) => (
        <IconButton
          size="small"
          onClick={() => onRemove(item.id)}
          sx={{ color: 'error.dark' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    }),
    [onRemove],
  );

  return (
    <DataTable
      columns={columns}
      items={items}
      getRowKey={(item) => item.id}
      rowAction={rowAction}
      hideWhenEmpty
    />
  );
}
