import { TextField, type TextFieldProps } from '@mui/material';

type AppTextFieldProps = TextFieldProps;

export const AppTextField = ({
  sx,
  fullWidth = true,
  ...props
}: AppTextFieldProps) => {
  const mergedSx = Array.isArray(sx)
    ? [
        {
          bgcolor: 'common.white',
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            minHeight: 56,
          },
        },
        ...sx,
      ]
    : [
        {
          bgcolor: 'common.white',
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            minHeight: 56,
          },
        },
        sx,
      ];

  return <TextField fullWidth={fullWidth} sx={mergedSx} {...props} />;
};
