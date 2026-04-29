import { Box, Typography } from '@mui/material';
import { ChangeEvent, cloneElement, isValidElement, ReactElement } from 'react';

export type FormFieldProps = {
  children: ReactElement<Record<string, unknown>>;
  value?: string | number | boolean;
  title?: string;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  hide?: boolean;
  onChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
};

export const FormField = ({
  hide,
  value,
  title,
  label,
  required,
  helperText,
  placeholder,
  error,
  children,
  onChange,
}: FormFieldProps) => {
  if (hide) return null;

  if (!isValidElement(children)) {
    return null;
  }

  const updatedChild = cloneElement(children, {
    ...children.props,
    error,
    required,
    label,
    value,
    onChange,
    placeholder,
    sx: { ...(children.props.sx || {}), minWidth: '100%' },
  });

  return (
    <Box>
      {title && (
        <Typography sx={{ fontWeight: 600, mb: 0.75 }}>{title}</Typography>
      )}

      {updatedChild}
      {helperText && (
        <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};
