import { useState } from 'react';
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
  options?: string[];
  emptyOptionLabel?: string;
  helperText?: string;
  fullWidth?: boolean;
  children?: ReactNode;
}

export const AppSelect = ({
  label,
  options,
  helperText,
  sx,
  value,
  defaultValue = '',
  error,
  onOpen,
  onClose,
  children,
  ...props
}: AppSelectProps) => {
  const [open, setOpen] = useState(false);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : defaultValue;
  const hasValue = Array.isArray(currentValue)
    ? currentValue.length > 0
    : currentValue !== '';
  const shrink = open || hasValue;

  return (
    <FormControl error={error} sx={sx} required={props.required}>
      <InputLabel shrink={shrink}>{label}</InputLabel>
      <Select
        label={label}
        value={isControlled ? value : undefined}
        defaultValue={isControlled ? undefined : defaultValue}
        open={open}
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
        {...props}
      >
        {children ??
          options?.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
      </Select>
      {helperText && (
        <FormHelperText sx={{ fontSize: '0.875rem', fontWeight: 400 }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};
