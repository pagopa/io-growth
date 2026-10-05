import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ContactsSection } from './components/ContactsSection';
import { EntityDataSection } from './components/EntityDataSection';
import { InfoModal } from './components/InfoModal';
import { InternalContactSection } from './components/InternalContactSection';
import { TermsAndPrivacySection } from './components/TermsAndPrivacySection';
import { useCompleteDataForm } from './hooks/useCompleteDataForm';
import {
  useCreateOperatorProfileMutation,
  useGetOperatorProfileQuery,
  useUpdateOperatorProfileMutation,
} from '../../../features/profile/api';
import { hasStatus } from '../../../core/api/baseApi';
import { useToast } from '../../../contexts';
import { CompleteProfileModal } from '../../../components';

export default function OverviewCompleteDataPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as { operatorId?: unknown } | null;
  const operatorId =
    typeof routeState?.operatorId === 'string' && routeState.operatorId.trim()
      ? encodeURIComponent(routeState.operatorId)
      : undefined;
  const [infoModalType, setInfoModalType] = useState<'logo' | 'cover' | null>(
    null,
  );
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [profileAssetError, setProfileAssetError] = useState('');

  const [createProfile, { isLoading: isCreating }] =
    useCreateOperatorProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateOperatorProfileMutation();
  const isLoading = isCreating || isUpdating;
  const { data: profile, error: profileError } = useGetOperatorProfileQuery();
  const isProfileIncomplete = hasStatus(profileError, 404);

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
    logoError,
    coverError,
    privacyUrlError,
    termsUrlError,
    internalEmailError,
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
    handleInternalEmailChange,
    handleAddContact,
    handleRemoveContact,
    handleContactChange,
    handleContinueClick,
  } = useCompleteDataForm({
    profile,
    onValidSubmit: async (payload, files) => {
      try {
        setProfileAssetError('');
        if (profile) {
          await updateProfile({ profile: payload, ...files }).unwrap();
        } else {
          if (!files.logo || !files.image) return;
          await createProfile({
            profile: payload,
            logo: files.logo,
            image: files.image,
          }).unwrap();
        }
        navigate(-1);
        showToast('Dati salvati', 'success');
      } catch (error) {
        if (hasStatus(error, 400)) {
          setProfileAssetError(
            'L’immagine supera la dimensione massima consentita. Riprova',
          );
        }
        showToast(
          profile
            ? 'Errore nella modifica dei dati dell’ente'
            : 'Errore nella creazione dell’ente',
          'error',
        );
      }
    },
  });

  const { showToast } = useToast();

  const handleExitClick = () => {
    if (isProfileIncomplete) {
      setIsExitModalOpen(true);
    } else {
      navigate(-1);
    }
  };

  return (
    <Box sx={{ bgcolor: 'common.neutralGray', color: 'text.primary' }}>
      <Box component="main" sx={{ py: 3, pb: { xs: 14, md: 16 } }}>
        <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 0 } }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleExitClick}
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

            <Paper sx={{ p: 3, borderRadius: 2 }}>
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
                  logoPreviewSrc={
                    operatorId
                      ? `https://logos.ced.pagopa.it/${operatorId}`
                      : undefined
                  }
                  coverPreviewSrc={
                    operatorId
                      ? `https://images.ced.pagopa.it/${operatorId}`
                      : undefined
                  }
                  nameError={nameError}
                  websiteUrlError={websiteUrlError}
                  streetError={streetError}
                  cityError={cityError}
                  postalCodeError={postalCodeError}
                  provinceError={provinceError}
                  logoError={profileAssetError || logoError}
                  coverError={profileAssetError || coverError}
                  onNameChange={handleNameChange}
                  onSedeChange={handleSedeChange}
                  onWebsiteUrlChange={handleWebsiteUrlChange}
                  onStreetChange={handleStreetChange}
                  onCityChange={handleCityChange}
                  onPostalCodeChange={handlePostalCodeChange}
                  onProvinceChange={handleProvinceChange}
                  onLogoSelect={(file) => {
                    setProfileAssetError('');
                    void handleLogoSelect(file);
                  }}
                  onCoverSelect={(file) => {
                    setProfileAssetError('');
                    void handleCoverSelect(file);
                  }}
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
                  privacyUrlError={privacyUrlError}
                  termsUrlError={termsUrlError}
                  onPrivacyUrlChange={handlePrivacyUrlChange}
                  onTermsUrlChange={handleTermsUrlChange}
                />
              </Stack>
            </Paper>

            <InternalContactSection
              submitted={isSubmitted}
              email={formData.internalEmail}
              emailError={internalEmailError}
              onEmailChange={handleInternalEmailChange}
            />

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
