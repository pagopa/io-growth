import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { memo } from 'react';
import { ContactRow } from '../../../../components/ContactRow';
import type { ContactFormData } from '../types';

interface ContactsSectionProps {
  submitted: boolean;
  contacts: ContactFormData[];
  onAddContact: () => void;
  onRemoveContact: (index: number) => void;
  onContactChange: (
    index: number,
    field: keyof ContactFormData,
    value: string,
  ) => void;
}

export const ContactsSection = memo(
  ({
    submitted,
    contacts,
    onAddContact,
    onRemoveContact,
    onContactChange,
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
              required={i === 0}
              contact={contact}
              index={i}
              attempted={submitted}
              canRemove={i !== 0}
              onRemove={onRemoveContact}
              onChange={(idx, field, value) =>
                onContactChange(idx, field as keyof ContactFormData, value)
              }
              removeIcon={<CancelIcon />}
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
