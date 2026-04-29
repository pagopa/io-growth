import { TextField, type TextFieldProps } from '@mui/material';

type AppTextFieldProps = TextFieldProps;

export const AppTextField = ({
  sx,
  fullWidth = true,
  ...props
}: AppTextFieldProps) => {
  return <TextField fullWidth={fullWidth} sx={sx} {...props} />;
};
