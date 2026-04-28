import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectProps,
} from '@mui/material';

interface AppSelectProps extends Omit<
  SelectProps<string | string[]>,
  'children' | 'label'
> {
  label?: string;
  options?: Array<{ value: string; label: string }>;
  emptyOptionLabel?: string;
  helperText?: string;
  fullWidth?: boolean;
  children?: ReactNode;
  renderCustomOptions?: (params: {
    value: string;
    label: string;
    lastElement: boolean;
  }) => ReactNode;
}

export const AppSelect = ({
  label,
  options,
  helperText,
  fullWidth = false,
  sx,
  value,
  defaultValue = '',
  error,
  onOpen,
  onClose,
  children,
  renderCustomOptions,
  ...props
}: AppSelectProps) => {
  const [open, setOpen] = useState(false);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : defaultValue;
  const hasValue = Array.isArray(currentValue)
    ? currentValue.length > 0
    : currentValue !== '';
  const shrink = open || hasValue;

  const renderOptions = useCallback(() => {
    const renderItem = (params: {
      value: string;
      label: string;
      lastElement: boolean;
    }) => (renderCustomOptions ? renderCustomOptions(params) : params.label);

    return options?.map(({ label, value }, index) => (
      <MenuItem
        key={value}
        value={value}
        sx={{
          whiteSpace: 'normal',
          height: 'auto',
          paddingY: 1,
          '&:hover': {
            backgroundColor: 'transparent',
          },
          '&.Mui-focusVisible': {
            backgroundColor: 'transparent',
          },
        }}
      >
        {renderItem({
          label,
          value,
          lastElement: index === options.length - 1,
        })}
      </MenuItem>
    ));
  }, [options, renderCustomOptions]);

  return (
    <FormControl error={error} sx={sx}>
      <InputLabel shrink={shrink}>{label}</InputLabel>
      <Select
        label={label}
        value={isControlled ? value : undefined}
        defaultValue={isControlled ? undefined : defaultValue}
        open={open}
        renderValue={(selected) => {
          const selectedOpt = options?.find(
            ({ value }) => value === selected,
          )?.label;
          return selectedOpt || '';
        }}
        onOpen={(e) => {
          setOpen(true);
          onOpen?.(e);
        }}
        onClose={(e) => {
          setOpen(false);
          onClose?.(e);
        }}
        notched={shrink}
        error={error}
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom', // Ancora il menu alla parte bassa della select
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top', // La parte alta del menu parte dal punto di ancoraggio
            horizontal: 'left',
          },
          PaperProps: {
            sx: {
              maxHeight: 300, // Imposta qui l'altezza massima desiderata in pixel
              // L'overflow-y: 'auto' è gestito in automatico da MUI quando si fissa la maxHeight
            },
          },
        }}
        {...props}
      >
        {renderOptions()}
      </Select>
      {helperText && (
        <FormHelperText sx={{ fontSize: '0.875rem', fontWeight: 400 }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};
