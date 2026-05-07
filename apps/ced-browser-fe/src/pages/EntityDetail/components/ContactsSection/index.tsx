import { Call, Language, LocationOn } from '@mui/icons-material';
import { Box, ButtonBase, Divider, Stack, Typography } from '@mui/material';
import type { EntityContacts } from '../../../../features/entities/types.js';
import { SectionTitle } from '../SectionTitle/index.js';

type ContactRowProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
};

function ContactRow({ icon, label, href }: ContactRowProps) {
  return (
    <ButtonBase
      component="a"
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      sx={{
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 1.5,
        px: 0,
        py: 2,
        color: 'primary.main',
      }}
    >
      <Box sx={{ display: 'flex', flexShrink: 0, color: 'text.secondary' }}>
        {icon}
      </Box>
      <Typography
        component="span"
        sx={{
          fontSize: 16,
          fontWeight: 600,
          color: 'primary.main',
          textDecoration: 'underline',
        }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
}

export function ContactsSection({ contacts }: { contacts: EntityContacts }) {
  const hasAny = contacts.phone || contacts.website || contacts.address;
  if (!hasAny) return null;

  const googleMapsUrl = contacts.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contacts.address)}`
    : undefined;

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <SectionTitle label="Contatti e informazioni" />
      <Stack divider={<Divider sx={{ mx: 4 }} />} sx={{ mt: 1 }}>
        {contacts.phone && (
          <ContactRow
            icon={<Call sx={{ fontSize: 20, color: '#BBC2D6' }} />}
            label={`Chiama ${contacts.phone}`}
            href={`tel:${contacts.phone}`}
          />
        )}
        {contacts.website && (
          <ContactRow
            icon={<Language sx={{ fontSize: 20, color: '#BBC2D6' }} />}
            label="Visita il sito"
            href={contacts.website}
          />
        )}
        {googleMapsUrl && (
          <ContactRow
            icon={<LocationOn sx={{ fontSize: 20, color: '#BBC2D6' }} />}
            label="Ottieni indicazioni stradali"
            href={googleMapsUrl}
          />
        )}
      </Stack>
    </Box>
  );
}
