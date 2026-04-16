import {
  Box,
  Button,
  IconButton,
  ListItemText,
  MenuItem,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { ButtonNaked, Chip } from '@pagopa/mui-italia';
import { useMemo } from 'react';
import { AppCheckbox, AppModal, AppSelect } from '../../../../components';
import type { Location } from '../../../../features/location/types';

interface SelectedChipListProps {
  locations: Location[];
  selected: string[];
  onDeselect: (ids: string[]) => void;
}

function SelectedChipList({ locations, selected, onDeselect }: SelectedChipListProps) {
  const locationMap = useMemo(
    () => new Map(locations.map((s) => [s.id, s])),
    [locations],
  );

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {selected.map((id) => {
        const item = locationMap.get(id);
        return item ? (
          <Chip
            key={id}
            label={item.name}
            color="default"
            size="small"
            onDelete={() => onDeselect(selected.filter((v) => v !== id))}
            onMouseDown={(e) => e.stopPropagation()}
            sx={{ '& .MuiChip-deleteIcon': { color: '#0B3EE3' } }}
          />
        ) : null;
      })}
    </Box>
  );
}

interface SelectLocationModalProps {
  open: boolean;
  locations: Location[];
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
  const isAllSelected = selected.length === locations.length && locations.length > 0;

  const handleToggleAll = () => {
    if (isAllSelected) {
      onSelectedChange([]);
    } else {
      onSelectedChange(locations.map((s) => s.id));
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Le tue sedi"
      description="Se non è presente nell'elenco, aggiungi una nuova sede."
    >
      <AppSelect
        multiple
        displayEmpty
        value={selected}
        onChange={(e) => {
          const {
            target: { value },
          } = e;
          const selectedValues =
            typeof value === 'string' ? value.split(',') : value;

          if (selectedValues.includes('all')) {
            handleToggleAll();
          } else {
            onSelectedChange(selectedValues);
          }
        }}
        label="Seleziona una o più sedi"
        endAdornment={
          selected.length > 0 ? (
            <IconButton
              size="small"
              sx={{ mr: 3 }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onSelectedChange([]);
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 18, color: '#0E0F13', '& path': { stroke: '#0E0F13', strokeWidth: 1.5 } }} />
            </IconButton>
          ) : undefined
        }
        renderValue={(vals) => (
          <SelectedChipList
            locations={locations}
            selected={vals as string[]}
            onDeselect={onSelectedChange}
          />
        )}
        fullWidth
      >
        <MenuItem
          value="all"
          sx={{
            color: 'common.primaryButton',
            fontWeight: 600,
            py: 1.5,
            px: 2,
            '&:hover': {
              bgcolor: 'rgba(11, 62, 227, 0.04)',
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'common.primaryButton',
            }}
          >
            {isAllSelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
          </Typography>
        </MenuItem>
        {locations.map((location) => (
          <MenuItem
            key={location.id}
            value={location.id}
            sx={{
              alignItems: 'flex-start',
              '&.Mui-selected': { color: 'text.primary' },
              '&.Mui-selected:hover': { color: 'text.primary' },
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.primary' }}>
                  <LocationOnIcon sx={{ fontSize: 16, color: '#BBC2D6' }} />
                  {location.name}
                </Box>
              }
              secondary={location.address}
              secondaryTypographyProps={{ sx: { pl: '20px' } }}
            />
            <AppCheckbox
              checked={selected.includes(location.id)}
              sx={{ mt: 0.25 }}
            />
          </MenuItem>
        ))}
      </AppSelect>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <ButtonNaked onClick={onAddNew}>Aggiungi nuova sede</ButtonNaked>
        <Button
          variant="contained"
          onClick={() => onConfirm(selected)}
          sx={{ textTransform: 'none', px: 3, py: 1 }}
        >
          Conferma
        </Button>
      </Box>
    </AppModal>
  );
}
