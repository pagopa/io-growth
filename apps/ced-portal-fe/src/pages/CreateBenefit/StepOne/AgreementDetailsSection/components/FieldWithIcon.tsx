import { Box, Stack } from '@mui/material';
import { AppTextField } from '../../../../../components';

type FieldWithIconProps = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  label: string;
  value?: string | number;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
};

export const FieldWithIcon = ({
  icon,
  value,
  label,
  error,
  errorMessage,
  onChange,
  disabled,
}: FieldWithIconProps) => {
  return (
    <Stack direction="row" spacing={1} alignItems="stretch">
      <Box
        sx={{
          width: 56,
          height: 56,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          color: 'text.secondary',
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <AppTextField
        label={label}
        value={value}
        error={error}
        helperText={error ? errorMessage : undefined}
        onChange={onChange}
        fullWidth
        disabled={disabled}
      />
    </Stack>
  );
};
