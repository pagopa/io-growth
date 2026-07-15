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
import { trackBrowserEvent } from '../../mixpanel/trackEvent';

type ContactsSectionProps = {
  contacts: EntityContacts;
  trackExtraProperties: Record<string, string>;
};

export function ContactsSection({
  contacts,
  trackExtraProperties,
}: ContactsSectionProps) {
  const hasAny =
    contacts.phone ||
    contacts.website ||
    contacts.address ||
    contacts.privacyUrl ||
    contacts.termsUrl;
  if (!hasAny) return null;

  const googleMapsUrl = buildGoogleMapsUrl(contacts.address);

  const trackContactEvent = (
    cta_type: 'telephone' | 'website' | 'directions',
  ) =>
    trackBrowserEvent('CED_LOCATION_CONTACT', {
      ...trackExtraProperties,
      cta_type,
    });

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <SectionTitle label="Contatti e informazioni" />
      <Stack divider={<Divider sx={{ mx: 4 }} />} sx={{ mt: 1 }}>
        {contacts.phone && (
          <ContactRow
            icon={<Call sx={{ fontSize: 20, color: '#BBC2D6' }} />}
            label={`Chiama ${contacts.phone}`}
            href={`tel:${contacts.phone}`}
            onClick={() => trackContactEvent('telephone')}
          />
        )}
        {contacts.website && (
          <ContactRow
            icon={<Language sx={{ fontSize: 20, color: '#BBC2D6' }} />}
            label="Visita il sito"
            href={contacts.website}
            onClick={() => trackContactEvent('website')}
          />
        )}
        {googleMapsUrl && (
          <ContactRow
            icon={<LocationOn sx={{ fontSize: 20, color: '#BBC2D6' }} />}
            label="Ottieni indicazioni stradali"
            href={googleMapsUrl}
            onClick={() => trackContactEvent('directions')}
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
