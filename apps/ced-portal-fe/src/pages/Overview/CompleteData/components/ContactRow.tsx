import { Stack } from '@mui/material';
import { AppTextField } from '../../../../components';
import type { Contact } from '../types';

interface ContactRowProps {
  contact: Contact;
  index: number;
  onChange: (index: number, field: keyof Contact, value: string) => void;
}

export const ContactRow = ({ contact, index, onChange }: ContactRowProps) => {
  return (
    <Stack spacing={3}>
      <AppTextField
        required
        label={
          index === 0 ? 'Inserisci contatto' : `Inserisci contatto ${index + 1}`
        }
        placeholder="Inserisci contatto"
        value={contact.contact}
        onChange={(e) => onChange(index, 'contact', e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': { borderRadius: '8px' },
        }}
      />
      <AppTextField
        label={index === 0 ? 'Sito web' : `Sito web ${index + 1}`}
        placeholder="Sito web"
        value={contact.website}
        onChange={(e) => onChange(index, 'website', e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': { borderRadius: '8px' },
        }}
      />
    </Stack>
  );
};
