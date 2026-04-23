import type React from 'react';
import { useState } from 'react';
import {
  Autocomplete,
  type AutocompleteProps as MuiAutocompleteProps,
  MenuItem,
} from '@mui/material';
import { AppTextField } from '../TextField';

export interface AutocompleteOption {
  label: string;
  [key: string]: unknown;
}

type BaseMuiProps<T> = MuiAutocompleteProps<T | string, false, false, true>;

export interface AppAutocompleteProps<
  T extends AutocompleteOption,
> extends Pick<BaseMuiProps<T>, 'sx' | 'open'> {
  label: React.ReactNode;
  options: T[];
  inputValue: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  onValueChange?: (value: string) => void;
  onSelect?: (option: T) => void;
}

export function AppAutocomplete<T extends AutocompleteOption>({
  label,
  inputValue,
  options,
  open,
  required,
  error,
  helperText,
  onValueChange,
  onSelect,
  ...props
}: AppAutocompleteProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectionMade, setSelectionMade] = useState(false);
  const hasResults = options.length > 0;
    const isOpen = open ?? (hasResults && isFocused && !selectionMade);

  return (
    <Autocomplete
      freeSolo
      sx={{ '& .Autocomplete-clearIndicator': { display: 'none' } }}
      open={isOpen}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      filterOptions={(x) => x}
      options={options}
      getOptionLabel={(option: T | string) =>
        typeof option === 'string' ? option : option.label
      }
      inputValue={inputValue}
      onInputChange={(_event, value) => {
        setSelectionMade(false);
        onValueChange?.(value);
      }}
      onChange={
        onSelect
          ? (_event, value) => {
              if (value && typeof value !== 'string') {
                setSelectionMade(true);
                onSelect(value);
              }
            }
          : undefined
      }
      slotProps={{
        popper: { disablePortal: false },
        paper: { elevation: 8 },
      }}
      renderOption={(props, option: T | string) => (
        <MenuItem
          {...props}
          key={typeof option === 'string' ? option : option.label}
        >
          {typeof option === 'string' ? option : option.label}
        </MenuItem>
      )}
      renderInput={(params) => (
        <AppTextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
        />
      )}
      {...props}
    />
  );
}
