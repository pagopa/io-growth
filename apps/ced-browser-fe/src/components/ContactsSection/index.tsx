import {
  Call,
  Language,
  LocationOn,
  MenuBook,
  VerifiedUser,
} from '@mui/icons-material';
import { Box, Divider, Stack } from '@mui/material';
import { buildGoogleMapsUrl } from '../../utils';
import { SectionTitle } from '../SectionTitle';
import { ContactRow } from '../ContactRow';
import { EntityContacts } from '../../features/entities/types';

export function ContactsSection({ contacts }: { contacts: EntityContacts }) {
  const hasAny =
    contacts.phone ||
    contacts.website ||
    contacts.address ||
    contacts.privacyUrl ||
    contacts.termsUrl;
  if (!hasAny) return null;

  const googleMapsUrl = buildGoogleMapsUrl(contacts.address);

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
        {contacts.privacyUrl && (
          <ContactRow
            icon={<VerifiedUser sx={{ fontSize: 20, color: '#BBC2D6' }} />}
            label="Informativa sulla privacy"
            href={contacts.privacyUrl}
          />
        )}
        {contacts.termsUrl && (
          <ContactRow
            icon={<MenuBook sx={{ fontSize: 20, color: '#BBC2D6' }} />}
            label="Termini e condizioni d'uso"
            href={contacts.termsUrl}
          />
        )}
      </Stack>
    </Box>
  );
}
