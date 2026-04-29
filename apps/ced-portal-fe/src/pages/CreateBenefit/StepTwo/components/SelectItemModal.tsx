import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Box,
  Button,
  IconButton,
  ListItemText,
  MenuItem,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ButtonNaked, Chip } from '@pagopa/mui-italia';
import { useMemo, type ReactNode } from 'react';
import { AppCheckbox, AppModal, AppSelect } from '../../../../components';

interface NamedItem {
  id: string;
  name: string;
}

interface SelectedChipListProps<T extends NamedItem> {
  items: T[];
  selected: string[];
  onDeselect: (ids: string[]) => void;
}

function SelectedChipList<T extends NamedItem>({
  items,
  selected,
  onDeselect,
}: SelectedChipListProps<T>) {
  const itemMap = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {selected.map((id) => {
        const item = itemMap.get(id);
        return item ? (
          <Chip
            key={id}
            label={item.name}
            color="default"
            size="small"
            onDelete={() => onDeselect(selected.filter((v) => v !== id))}
            onMouseDown={(e) => e.stopPropagation()}
            sx={{ '& .MuiChip-deleteIcon': { color: 'common.primaryButton' } }}
          />
        ) : null;
      })}
    </Box>
  );
}

interface SelectItemModalProps<T extends NamedItem> {
  open: boolean;
  items: T[];
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
  onClose: () => void;
  onAddNew: () => void;
  onConfirm: (ids: string[]) => void;
  title: string;
  description: string;
  label: string;
  addNewLabel: string;
  icon: ReactNode;
  getSubtitle: (item: T) => string;
}

export function SelectItemModal<T extends NamedItem>({
  open,
  items,
  selected,
  onSelectedChange,
  onClose,
  onAddNew,
  onConfirm,
  title,
  description,
  label,
  addNewLabel,
  icon,
  getSubtitle,
}: SelectItemModalProps<T>) {
  const theme = useTheme();
  const isAllSelected = selected.length === items.length && items.length > 0;

  const handleToggleAll = () => {
    if (isAllSelected) {
      onSelectedChange([]);
    } else {
      onSelectedChange(items.map((item) => item.id));
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
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
        label={label}
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
              <CloseRoundedIcon
                sx={{
                  fontSize: 18,
                  color: 'common.neutralBlack',
                  '& path': { stroke: 'common.neutralBlack', strokeWidth: 1.5 },
                }}
              />
            </IconButton>
          ) : undefined
        }
        renderValue={(vals) => (
          <SelectedChipList
            items={items}
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
              bgcolor: alpha(theme.palette.common.primaryButton, 0.04),
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
        {items.map((item) => (
          <MenuItem
            key={item.id}
            value={item.id}
            sx={{
              alignItems: 'flex-start',
              '&.Mui-selected': { color: 'text.primary' },
              '&.Mui-selected:hover': { color: 'text.primary' },
            }}
          >
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.primary',
                  }}
                >
                  {icon}
                  {item.name}
                </Box>
              }
              secondary={getSubtitle(item)}
              secondaryTypographyProps={{ sx: { pl: '20px' } }}
            />
            <AppCheckbox
              checked={selected.includes(item.id)}
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
        <ButtonNaked onClick={onAddNew}>{addNewLabel}</ButtonNaked>
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
