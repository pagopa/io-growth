import type React from 'react';
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
> extends Pick<
  BaseMuiProps<T>,
  'onInputChange' | 'onChange' | 'onFocus' | 'onBlur' | 'sx' | 'open'
> {
  label: React.ReactNode;
  options: T[];
  inputValue: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export function AppAutocomplete<T extends AutocompleteOption>({
  label,
  inputValue,
  options,
  open,
  required,
  error,
  helperText,
  ...props
}: AppAutocompleteProps<T>) {
  const hasResults = options.length > 0;
  const isOpen = open !== undefined ? open : hasResults;

  return (
    <Autocomplete
      freeSolo
      sx={{ '& .Autocomplete-clearIndicator': { display: 'none' } }}
      open={isOpen}
      filterOptions={(x) => x}
      options={options}
      getOptionLabel={(option: T | string) =>
        typeof option === 'string' ? option : option.label
      }
      inputValue={inputValue}
      slotProps={{
        popper: {
          disablePortal: false,
        },
        paper: {
          elevation: 8,
        },
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
