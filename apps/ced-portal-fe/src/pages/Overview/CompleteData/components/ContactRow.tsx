import CancelIcon from '@mui/icons-material/Cancel';
import { Box, IconButton, Stack } from '@mui/material';
import { AppSelect, AppTextField } from '../../../../components';
import type { Contact } from '../types';

const CONTACT_TYPE_OPTIONS = ['Sito web', 'Telefono'];

interface ContactRowProps {
  contact: Contact;
  index: number;
  canRemove: boolean;
  showPhoneField?: boolean;
  showDetails?: boolean;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof Contact, value: string) => void;
}

export const ContactRow = ({
  contact,
  index,
  canRemove,
  showPhoneField = true,
  showDetails = true,
  onRemove,
  onChange,
}: ContactRowProps) => {
  const isPhoneType = contact.type === 'Telefono';

  return (
    <Stack spacing={4}>
      {showPhoneField && (
        <AppTextField
          required
          label="Inserisci numero di telefono"
          placeholder="Inserisci numero di telefono"
          value={contact.contact}
          onChange={(e) => onChange(index, 'contact', e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
          }}
        />
      )}

      {showDetails && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
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
              value={contact.type}
              onChange={(e) =>
                onChange(index, 'type', e.target.value as string)
              }
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />

            <AppTextField
              placeholder={
                isPhoneType ? 'Inserisci numero di telefono' : 'Inserisci url'
              }
              type={isPhoneType ? 'tel' : 'url'}
              value={contact.website}
              onChange={(e) => onChange(index, 'website', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>
        </Box>
      )}
    </Stack>
  );
};
