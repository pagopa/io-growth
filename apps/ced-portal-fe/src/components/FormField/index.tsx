import { Box, Typography } from '@mui/material';
import { minWidth } from '@mui/system';
import React from 'react';

export type FormFieldProps = {
  children: React.ReactElement<Record<string, unknown>>;
  value?: string | number | boolean;
  title?: string;
  label?: string;
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
  label,
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
    sx: { ...(children.props.sx || {}), minWidth: '100%' },
    ...(label !== undefined && { label }),
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
