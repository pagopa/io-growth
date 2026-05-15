import AddIcon from '@mui/icons-material/Add';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { memo } from 'react';
import { ContactRow } from './ContactRow';
import type { Contact } from '../types';

interface ContactsSectionProps {
  contacts: Contact[];
  onAddContact: () => void;
  onRemoveContact: (index: number) => void;
  onContactChange: (index: number, field: keyof Contact, value: string) => void;
  firstContactTypeError?: string;
  firstContactValueError?: string;
}

export const ContactsSection = memo(
  ({
    contacts,
    onAddContact,
    onRemoveContact,
    onContactChange,
    firstContactTypeError,
    firstContactValueError,
  }: ContactsSectionProps) => {
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
            <Typography
              fontWeight={600}
              fontSize={16}
              sx={{ lineHeight: 1.25 }}
            >
              Contatti per l’assistenza
            </Typography>
          </Stack>

          {contacts.map((contact, i) => (
            <ContactRow
              key={i}
              contact={contact}
              index={i}
              canRemove={i !== 0}
              onRemove={onRemoveContact}
              onChange={onContactChange}
              typeError={i === 0 ? firstContactTypeError : undefined}
              contactError={i === 0 ? firstContactValueError : undefined}
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
  },
);

ContactsSection.displayName = 'ContactsSection';
