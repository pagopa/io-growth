import { TextField, type TextFieldProps } from '@mui/material';

type AppTextFieldProps = TextFieldProps;

const baseSx = {
  bgcolor: 'common.white',
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    minHeight: 56,
  },
  '& .MuiFormLabel-asterisk': {
    color: '#e53935',
  },
};

export const AppTextField = ({
  sx,
  fullWidth = true,
  ...props
}: AppTextFieldProps) => {
  const mergedSx = Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx];

  return <TextField fullWidth={fullWidth} sx={mergedSx} {...props} />;
};
