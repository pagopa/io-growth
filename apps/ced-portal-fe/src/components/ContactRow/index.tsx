import { Box, IconButton } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useMemo, type ReactNode } from 'react';
import { AppSelect, AppTextField } from '../';
import {
  CONTACT_TYPE_OPTIONS,
  getContactInputConfig,
} from '../../pages/Overview/CompleteData/components/constants';
import type { SupportContactResponseType } from '../../core/api/generated/model';
import { getContactError, getTypeError } from './utils';

export interface ContactRowProps {
  contact: { type: SupportContactResponseType | ''; value: string };
  index: number;
  canRemove: boolean;
  attempted: boolean;
  onRemove: (index: number) => void;
  onChange: (index: number, field: 'type' | 'value', value: string) => void;
  required?: boolean;
  removeIcon: ReactNode;
  removeIconSx?: SxProps<Theme>;
}

export const ContactRow = ({
  contact,
  index,
  canRemove,
  attempted,
  onRemove,
  onChange,
  required,
  removeIcon,
  removeIconSx = { color: (theme) => theme.palette.common.requiredField, p: 0 },
}: ContactRowProps) => {
  const { placeholder, type: inputType } = getContactInputConfig(contact.type);

  const typeError = useMemo(
    () => getTypeError({ contact, attempted, required }),
    [contact, attempted, required],
  );

  const contactError = useMemo(
    () =>
      getContactError({
        contact,
        attempted,
        required,
        isUrl: inputType === 'url',
      }),
    [contact, attempted, required, inputType],
  );
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
      {canRemove && (
        <IconButton
          onClick={() => onRemove(index)}
          aria-label={`Remove contact ${index + 1}`}
          sx={removeIconSx}
        >
          {removeIcon}
        </IconButton>
      )}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          width: '100%',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '220px minmax(0, 1fr)',
            md: '260px minmax(0, 1fr)',
          },
        }}
      >
        <AppSelect
          required={required}
          label="Tipo di contatto"
          options={CONTACT_TYPE_OPTIONS}
          value={contact.type || 'email'}
          error={Boolean(typeError)}
          helperText={typeError}
          onChange={(e) => onChange(index, 'type', e.target.value as string)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />

        <AppTextField
          required={required}
          label={placeholder}
          type={inputType}
          error={Boolean(contactError)}
          helperText={contactError}
          value={contact.value}
          onChange={(e) => onChange(index, 'value', e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />
      </Box>
    </Box>
  );
};
