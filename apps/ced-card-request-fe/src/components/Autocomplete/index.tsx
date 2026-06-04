import {
  Autocomplete,
  MenuItem,
  type AutocompleteProps as MuiAutocompleteProps,
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
  inputValue?: string;
  label?: string;
  options: T[];
  required?: boolean;
  error?: boolean;
  helperText?: string;
  onValueChange?: (value: string) => void;
  onSelect?: (option: T) => void;
}

export function AppAutocomplete<T extends AutocompleteOption>({
  inputValue,
  label,
  options,
  required,
  error,
  helperText,
  onValueChange,
  onSelect,
}: Readonly<AppAutocompleteProps<T>>) {
  return (
    <Autocomplete
      inputValue={inputValue}
      selectOnFocus
      options={options}
      slotProps={{
        popper: { disablePortal: false },
        paper: { elevation: 8 },
      }}
      onInputChange={(_, value) => onValueChange?.(value)}
      onChange={(_, option) => {
        if (option) {
          const selectedOption =
            typeof option === 'string' ? { label: option } : option;
          onSelect?.(selectedOption as T);
        }
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
          hideErrorIcon
        />
      )}
    />
  );
}
