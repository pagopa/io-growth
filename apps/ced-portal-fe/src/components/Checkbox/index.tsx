import { Checkbox, type CheckboxProps } from '@mui/material';

export const AppCheckbox = ({ sx, ...props }: CheckboxProps) => (
  <Checkbox
    sx={[
      {
        color: 'common.primaryButton',
        '&.Mui-checked': { color: 'common.primaryButton' },
        p: 0,
        '& .MuiSvgIcon-root': { fontSize: 18 },
      },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ]}
    {...props}
  />
);
