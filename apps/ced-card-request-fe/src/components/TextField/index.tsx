import { TextField, InputAdornment, type TextFieldProps } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

type AppTextFieldProps = TextFieldProps & {
  hideErrorIcon?: boolean;
};

export const AppTextField = ({
  sx,
  fullWidth = true,
  error,
  InputProps,
  hideErrorIcon,
  ...props
}: AppTextFieldProps) => {
  return (
    <TextField
      fullWidth={fullWidth}
      error={error}
      sx={{
        ...sx,
        ...(error && {
          '& .MuiOutlinedInput-root': {
            paddingRight: '14px',
          },
          '& .MuiOutlinedInput-input': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }),
      }}
      InputProps={{
        ...InputProps,
        ...(error &&
          !hideErrorIcon && {
            endAdornment: (
              <>
                {InputProps?.endAdornment}
                <InputAdornment position="end" sx={{ flexShrink: 0 }}>
                  <ErrorIcon color="error" />
                </InputAdornment>
              </>
            ),
          }),
      }}
      {...props}
    />
  );
};
