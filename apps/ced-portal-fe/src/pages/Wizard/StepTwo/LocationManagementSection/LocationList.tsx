import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { useMemo } from 'react';
import { DataTable } from '../../../../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../../../../components/DataTable/types';
import type { Location } from '../../../../features/location/types';

interface LocationListProps {
  locations: Location[];
  onRemove: (id: string) => void;
}

const locationColumns: DataTableColumn<Location>[] = [
  {
    id: 'name',
    label: 'Nome',
    renderCell: (item) => item.name,
  },
  {
    id: 'address',
    label: 'Indirizzo',
    renderCell: (item) => item.address,
  },
];

export function LocationList({ locations, onRemove }: LocationListProps) {
  const rowAction = useMemo<DataTableRowAction<Location>>(
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
      columns={locationColumns}
      items={locations}
      getRowKey={(item) => item.id}
      rowAction={rowAction}
      hideWhenEmpty
    />
  );
}
