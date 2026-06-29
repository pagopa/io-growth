import { Box } from '@mui/material';
import { Body } from '@pagopa/io-core-ui';
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
      {title && <Body>{title}</Body>}
      {updatedChild}
      {helperText && <Body>{helperText}</Body>}
    </Box>
  );
};
