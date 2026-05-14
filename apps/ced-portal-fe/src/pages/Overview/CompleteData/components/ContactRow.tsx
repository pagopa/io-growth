import CancelIcon from '@mui/icons-material/Cancel';
import { Box, IconButton } from '@mui/material';
import { memo } from 'react';
import { AppSelect, AppTextField } from '../../../../components';
import type { Contact } from '../types';
import { CONTACT_TYPE_OPTIONS, getContactInputConfig } from './constants';

interface ContactRowProps {
  contact: Contact;
  index: number;
  canRemove: boolean;
  showPhoneField?: boolean;
  showDetails?: boolean;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof Contact, value: string) => void;
  typeError?: string;
  contactError?: string;
}

export const ContactRow = memo(
  ({
    contact,
    index,
    canRemove,
    onRemove,
    onChange,
    typeError,
    contactError,
  }: ContactRowProps) => {
    const contactInputBase = getContactInputConfig(contact.type);

    const contactInput = {
      ...contactInputBase,
      value: contact[contactInputBase.field],
    };

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
        {canRemove && (
          <IconButton
            onClick={() => onRemove(index)}
            sx={{ color: '#D13333', p: 0 }}
          >
            <CancelIcon />
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
            label="Tipo di contatto"
            options={CONTACT_TYPE_OPTIONS}
            value={contact.type || ''}
            error={Boolean(typeError)}
            helperText={typeError}
            onChange={(e) => onChange(index, 'type', e.target.value as string)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />

          <AppTextField
            required={!canRemove}
            label={contactInput.placeholder}
            type={contactInput.type}
            value={contactInput.value}
            error={Boolean(contactError)}
            helperText={contactError}
            onChange={(e) =>
              onChange(index, contactInput.field, e.target.value)
            }
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
        </Box>
      </Box>
    );
  },
);

ContactRow.displayName = 'ContactRow';
