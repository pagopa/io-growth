import { MenuItem, Select, type SelectProps } from '@mui/material';

interface AppSelectProps extends Omit<
  SelectProps<string>,
  'renderValue' | 'children'
> {
  placeholder?: string;
  options: string[];
  emptyOptionLabel?: string;
}

export const AppSelect = ({
  placeholder,
  options,
  emptyOptionLabel,
  sx,
  displayEmpty = true,
  defaultValue = '',
  ...props
}: AppSelectProps) => {
  const mergedSx = Array.isArray(sx)
    ? [
        {
          minWidth: { xs: '100%' },
          maxWidth: { xs: '100%' },
          bgcolor: 'common.white',
          borderRadius: 2,
          minHeight: 56,
        },
        ...sx,
      ]
    : [
        {
          minWidth: { xs: '100%' },
          maxWidth: { xs: '100%' },
          bgcolor: 'common.white',
          borderRadius: 2,
          minHeight: 56,
        },
        sx,
      ];

  return (
    <Select
      displayEmpty={displayEmpty}
      defaultValue={defaultValue}
      renderValue={(value) => (value === '' ? placeholder : value)}
      sx={mergedSx}
      {...props}
    >
      <MenuItem value="">{emptyOptionLabel ?? placeholder}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  );
};
