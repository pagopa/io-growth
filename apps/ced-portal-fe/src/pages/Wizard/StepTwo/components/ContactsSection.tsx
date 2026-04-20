import AddIcon from '@mui/icons-material/Add';
import { Box, Typography, useTheme } from '@mui/material';
import { ButtonNaked } from '@pagopa/mui-italia';
import type { Contact } from '../../../../features/location/types';
import { ContactRow } from './ContactRow';

interface ContactsSectionProps {
  contacts: Contact[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (params: { index: number; field: keyof Contact; value: string }) => void;
}

export function ContactsSection({ contacts, onAdd, onRemove, onChange }: ContactsSectionProps) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ color: theme.palette.text.secondary }}
      >
        Contatti di assistenza
      </Typography>

      {contacts.map((contact, index) => (
        <ContactRow
          key={index}
          contact={contact}
          index={index}
          onRemove={onRemove}
          onChange={onChange}
        />
      ))}

      <ButtonNaked
        startIcon={<AddIcon />}
        onClick={onAdd}
        sx={{
          alignSelf: 'flex-start',
          textTransform: 'none',
          color: theme.palette.common.primaryButton,
          fontSize: 16,
          '& .MuiButton-startIcon svg': { fontSize: 24 },
        }}
      >
        Aggiungi contatto
      </ButtonNaked>
    </Box>
  );
}
