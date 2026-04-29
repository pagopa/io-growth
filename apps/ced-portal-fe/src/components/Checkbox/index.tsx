import { Checkbox, type CheckboxProps } from '@mui/material';

export const AppCheckbox = ({ sx, ...props }: CheckboxProps) => (
  <Checkbox sx={sx} {...props} />
);
