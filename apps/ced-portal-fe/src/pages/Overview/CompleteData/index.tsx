import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactsSection } from './components/ContactsSection';
import { EntityDataSection } from './components/EntityDataSection';
import { InfoModal } from './components/InfoModal';
import type { CompleteDataFormData, Contact } from './types';
import { TermsAndPrivacySection } from './components/TermsAndPrivacySection';

const createEmptyContact = (): Contact => ({
  contact: '',
  type: '',
  website: '',
});

const INITIAL_FORM_DATA: CompleteDataFormData = {
  name: '',
  sede: 'fisica',
  address: '',
  contacts: [createEmptyContact()],
  logoFile: null,
  coverFile: null,
};

export default function OverviewCompleteDataPage() {
  const navigate = useNavigate();
  const [infoModalType, setInfoModalType] = useState<'logo' | 'cover' | null>(
    null,
  );
  const [formData, setFormData] =
    useState<CompleteDataFormData>(INITIAL_FORM_DATA);

  const updateField = <K extends keyof CompleteDataFormData>(
    field: K,
    value: CompleteDataFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, createEmptyContact()],
    }));
  };

  const handleRemoveContact = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contacts:
        prev.contacts.length > 1
          ? prev.contacts.filter((_, i) => i !== index)
          : [createEmptyContact()],
    }));
  };

  const handleContactChange = (
    index: number,
    field: keyof Contact,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact,
      ),
    }));
  };

  return (
    <Box
      sx={{
        bgcolor: 'common.neutralGray',
        color: 'text.primary',
      }}
    >
      <Box component="main" sx={{ py: 3, pb: { xs: 14, md: 16 } }}>
        <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 0 } }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ width: 24, height: 24 }} />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 3,
              color: 'common.neutralBlack',
              textTransform: 'none',
              p: 0,
            }}
          >
            Esci
          </Button>

          <Stack spacing={3}>
            {/* Intestazione pagina */}
            <Box>
              <Stack spacing={1}>
                <Typography variant="h4" sx={{ fontSize: 32, fontWeight: 700 }}>
                  Completa i dati dell&apos;ente
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: 18, color: 'text.secondary' }}
                >
                  Queste informazioni saranno usate per identificarti
                  sull&apos;app IO
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ mt: 3, color: 'error.dark' }}
              >
                * Campo obbligatorio
              </Typography>
            </Box>

            {/* Card principale */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2.5,
                display: 'flex',
                p: 3,
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 1,
                alignSelf: 'stretch',
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Informazioni visibili su IO
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Completa o modifica le informazioni del tuo ente.
              </Typography>
              <Stack spacing={2} sx={{ width: '100%' }}>
                <EntityDataSection
                  name={formData.name}
                  sede={formData.sede}
                  address={formData.address}
                  logoFile={formData.logoFile}
                  coverFile={formData.coverFile}
                  onNameChange={(value) => updateField('name', value)}
                  onSedeChange={(value) => updateField('sede', value)}
                  onAddressChange={(value) => updateField('address', value)}
                  onLogoSelect={(file) => updateField('logoFile', file)}
                  onCoverSelect={(file) => updateField('coverFile', file)}
                  onInfoClick={setInfoModalType}
                />

                <ContactsSection
                  contacts={formData.contacts}
                  onAddContact={handleAddContact}
                  onRemoveContact={handleRemoveContact}
                  onContactChange={handleContactChange}
                />

                {/* Sezione Termini e Privacy */}
                <TermsAndPrivacySection />
              </Stack>
            </Paper>

            {/* Footer con tasto Continua */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  console.log('Form submitted:', formData);
                  // TODO: Handle form submission
                }}
                sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
              >
                Continua
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>

      <InfoModal
        open={infoModalType !== null}
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
      />
    </Box>
  );
}
