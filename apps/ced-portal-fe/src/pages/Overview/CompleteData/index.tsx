import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContactsSection } from './components/ContactsSection';
import { EntityDataSection } from './components/EntityDataSection';
import { InfoModal } from './components/InfoModal';
import { TermsAndPrivacySection } from './components/TermsAndPrivacySection';
import { useCompleteDataForm } from './hooks/useCompleteDataForm';
import { useCreateOperatorProfileMutation } from '../../../features/profile/api';
import { useToast } from '../../../contexts';
import { CompleteProfileModal } from '../../../components';

export default function OverviewCompleteDataPage() {
  const navigate = useNavigate();
  const [infoModalType, setInfoModalType] = useState<'logo' | 'cover' | null>(
    null,
  );
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const [createProfile, { isLoading }] = useCreateOperatorProfileMutation();

  const {
    isSubmitted,
    formData,
    sedeError,
    nameError,
    websiteUrlError,
    streetError,
    cityError,
    postalCodeError,
    provinceError,
    handleNameChange,
    handleSedeChange,
    handleWebsiteUrlChange,
    handleStreetChange,
    handleCityChange,
    handlePostalCodeChange,
    handleProvinceChange,
    handleLogoSelect,
    handleCoverSelect,
    handlePrivacyUrlChange,
    handleTermsUrlChange,
    handleAddContact,
    handleRemoveContact,
    handleContactChange,
    handleContinueClick,
  } = useCompleteDataForm({
    onValidSubmit: async (payload) => {
      try {
        await createProfile(payload).unwrap();
        navigate(-1);
        showToast('Dati salvati', 'success');
      } catch (error) {
        showToast('Errore nella creazione dell’ente', 'error');
        throw error;
      }
    },
  });

  const { showToast } = useToast();

  return (
    <Box sx={{ bgcolor: 'common.neutralGray', color: 'text.primary' }}>
      <Box component="main" sx={{ py: 3, pb: { xs: 14, md: 16 } }}>
        <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 0 } }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setIsExitModalOpen(true)}
            sx={{ mb: 3, textTransform: 'none', p: 0 }}
          >
            Esci
          </Button>

          <Stack spacing={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                Completa i dati dell’ente
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight={400}
              >
                Queste informazioni saranno usate per identificarti sull’app IO.
              </Typography>
              <Typography
                variant="body2"
                color="common.requiredField"
                fontWeight={600}
                sx={{ mt: 2 }}
              >
                * Campo obbligatorio
              </Typography>
            </Box>

            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <EntityDataSection
                  name={formData.name}
                  sede={formData.sede}
                  sedeError={sedeError}
                  websiteUrl={formData.websiteUrl}
                  street={formData.street}
                  city={formData.city}
                  postalCode={formData.postalCode}
                  province={formData.province}
                  logoFile={formData.logoFile}
                  coverFile={formData.coverFile}
                  nameError={nameError}
                  websiteUrlError={websiteUrlError}
                  streetError={streetError}
                  cityError={cityError}
                  postalCodeError={postalCodeError}
                  provinceError={provinceError}
                  onNameChange={handleNameChange}
                  onSedeChange={handleSedeChange}
                  onWebsiteUrlChange={handleWebsiteUrlChange}
                  onStreetChange={handleStreetChange}
                  onCityChange={handleCityChange}
                  onPostalCodeChange={handlePostalCodeChange}
                  onProvinceChange={handleProvinceChange}
                  onLogoSelect={handleLogoSelect}
                  onCoverSelect={handleCoverSelect}
                  onInfoClick={setInfoModalType}
                />

                <ContactsSection
                  submitted={isSubmitted}
                  contacts={formData.contacts}
                  onAddContact={handleAddContact}
                  onRemoveContact={handleRemoveContact}
                  onContactChange={handleContactChange}
                />

                <TermsAndPrivacySection
                  privacyUrl={formData.privacyUrl}
                  termsUrl={formData.termsUrl}
                  onPrivacyUrlChange={handlePrivacyUrlChange}
                  onTermsUrlChange={handleTermsUrlChange}
                />
              </Stack>
            </Paper>

            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                size="large"
                onClick={handleContinueClick}
                disabled={isLoading}
              >
                {isLoading ? 'Salvataggio...' : 'Continua'}
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

      <CompleteProfileModal
        open={isExitModalOpen}
        onClose={() => navigate(-1)}
        onCompleteData={() => setIsExitModalOpen(false)}
      />
    </Box>
  );
}
