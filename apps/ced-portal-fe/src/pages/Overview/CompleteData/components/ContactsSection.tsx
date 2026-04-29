import AddIcon from '@mui/icons-material/Add';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { ContactRow } from './ContactRow';
import type { Contact } from '../types';

interface ContactsSectionProps {
  contacts: Contact[];
  onAddContact: () => void;
  onRemoveContact: (index: number) => void;
  onContactChange: (index: number, field: keyof Contact, value: string) => void;
}

export const ContactsSection = ({
  contacts,
  onAddContact,
  onRemoveContact,
  onContactChange,
}: ContactsSectionProps) => {
  const [primaryContact, ...additionalContacts] = contacts;

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, p: { xs: 1.5, md: 2 }, width: '100%' }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ForumOutlinedIcon
            sx={{ color: 'common.decorativeIcon', fontSize: 20 }}
          />
          <Typography fontWeight={700} fontSize={16} sx={{ lineHeight: 1.25 }}>
            Contatti per l’assistenza
          </Typography>
        </Stack>

        {primaryContact && (
          <ContactRow
            key={0}
            contact={primaryContact}
            index={0}
            canRemove={false}
            showPhoneField
            showDetails={false}
            onRemove={onRemoveContact}
            onChange={onContactChange}
          />
        )}

        {additionalContacts.map((contact, i) => (
          <ContactRow
            key={i + 1}
            contact={contact}
            index={i + 1}
            canRemove
            showPhoneField={false}
            showDetails
            onRemove={onRemoveContact}
            onChange={onContactChange}
          />
        ))}

        <Box>
          <Button
            startIcon={<AddIcon />}
            onClick={onAddContact}
            sx={{ textTransform: 'none', fontWeight: 600, p: 0 }}
          >
            Aggiungi contatto
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};
