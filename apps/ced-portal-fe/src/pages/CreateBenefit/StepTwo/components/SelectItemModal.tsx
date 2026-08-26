import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Box,
  Button,
  Chip,
  IconButton,
  ListItemText,
  Typography,
  Chip,
} from '@mui/material';
import { ButtonNaked } from '@pagopa/mui-italia';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { AppCheckbox, AppModal, AppSelect } from '../../../../components';

interface NamedItem {
  id: string;
  name: string;
}

interface SelectItemOptionProps<T extends NamedItem> {
  value: string;
  label: string;
  items: T[];
  icon: ReactNode;
  getSubtitle: (item: T) => string;
  selected: string[];
}

export function SelectItemOption<T extends NamedItem>({
  value,
  label,
  items,
  icon,
  getSubtitle,
  selected,
}: SelectItemOptionProps<T>) {
  const item = items.find((i) => i.id === value);
  return (
    <>
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
            {label}
          </Box>
        }
        secondary={item ? getSubtitle(item) : ''}
        secondaryTypographyProps={{ sx: { pl: '20px' } }}
      />
      <AppCheckbox checked={selected.includes(value)} sx={{ mt: 0.25 }} />
    </>
  );
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
  emptySelectionError?: string;
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
  emptySelectionError,
}: SelectItemModalProps<T>) {
  const [attempted, setAttempted] = useState(false);
  const isAllSelected = selected.length === items.length && items.length > 0;
  const hasError = attempted && selected.length === 0;

  const handleToggleAll = useCallback(() => {
    if (isAllSelected) {
      onSelectedChange([]);
    } else {
      onSelectedChange(items.map((item) => item.id));
    }
  }, [isAllSelected, items, onSelectedChange]);

  const renderValue = useCallback(
    (vals: string | string[]) => (
      <SelectedChipList
        items={items}
        selected={vals as string[]}
        onDeselect={onSelectedChange}
      />
    ),
    [items, onSelectedChange],
  );

  const renderOption = useCallback(
    ({ value, label }: { value: string; label: string }) => {
      if (value === 'all') {
        return (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: 'common.primaryButton' }}
          >
            {label}
          </Typography>
        );
      }
      return (
        <SelectItemOption
          value={value}
          label={label}
          items={items}
          icon={icon}
          getSubtitle={getSubtitle}
          selected={selected}
        />
      );
    },
    [items, icon, getSubtitle, selected],
  );

  const handleChange = useCallback(
    (e: { target: { value: string | string[] } }) => {
      const selectedValues =
        typeof e.target.value === 'string'
          ? e.target.value.split(',')
          : e.target.value;

      if (selectedValues.includes('all')) {
        handleToggleAll();
      } else {
        onSelectedChange(selectedValues);
      }
    },
    [handleToggleAll, onSelectedChange],
  );

  const endAdornment =
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
    ) : undefined;

  const selectOptions = useMemo(
    () => [
      {
        value: 'all',
        label: isAllSelected ? 'Deseleziona tutti' : 'Seleziona tutti',
      },
      ...items.map((item) => ({ value: item.id, label: item.name })),
    ],
    [isAllSelected, items],
  );

  const handleClose = useCallback(() => {
    setAttempted(false);
    onClose();
  }, [onClose]);

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
    >
      <AppSelect
        multiple
        displayEmpty
        value={selected}
        onChange={handleChange}
        label={label}
        endAdornment={endAdornment}
        options={selectOptions}
        renderValue={renderValue}
        renderCustomOptions={renderOption}
        error={hasError}
        helperText={hasError ? emptySelectionError : undefined}
        fullWidth
      />
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
          onClick={() => {
            setAttempted(true);
            if (selected.length > 0) onConfirm(selected);
          }}
          sx={{ textTransform: 'none', px: 3, py: 1 }}
        >
          Conferma
        </Button>
      </Box>
    </AppModal>
  );
}
