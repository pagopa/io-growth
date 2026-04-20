import { Box, Typography } from '@mui/material';
import React from 'react';

export type FormFieldProps = {
  children: React.ReactElement<Record<string, unknown>>;
  value?: string | number | boolean;
  title?: string;
  helperText?: string;
  placeholder?: string;
  hide?: boolean;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
};

export const FormField = ({
  hide,
  value,
  title,
  helperText,
  placeholder,
  children,
  onChange,
}: FormFieldProps) => {
  if (hide) return null;

  if (!React.isValidElement(children)) {
    return null;
  }

  const updatedChild = React.cloneElement(children, {
    ...children.props,
    value,
    onChange,
    placeholder,
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
