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

export default function OverviewCompleteDataPage() {
  const navigate = useNavigate();
  const [infoModalType, setInfoModalType] = useState<'logo' | 'cover' | null>(
    null,
  );

  const [createProfile, { isLoading }] = useCreateOperatorProfileMutation();

  const {
    formData,
    nameError,
    addressError,
    visibleFirstContactTypeError,
    visibleFirstContactValueError,
    handleNameChange,
    handleSedeChange,
    handleAddressChange,
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
            onClick={() => navigate(-1)}
            sx={{ mb: 3, textTransform: 'none', p: 0 }}
          >
            Esci
          </Button>

          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Completa i dati dell’ente
              </Typography>
            </Box>

            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <EntityDataSection
                  name={formData.name}
                  sede={formData.sede}
                  address={formData.address}
                  logoFile={formData.logoFile}
                  coverFile={formData.coverFile}
                  nameError={nameError}
                  addressError={addressError}
                  onNameChange={handleNameChange}
                  onSedeChange={handleSedeChange}
                  onAddressChange={handleAddressChange}
                  onLogoSelect={handleLogoSelect}
                  onCoverSelect={handleCoverSelect}
                  onInfoClick={setInfoModalType}
                />

                <ContactsSection
                  contacts={formData.contacts}
                  firstContactTypeError={visibleFirstContactTypeError}
                  firstContactValueError={visibleFirstContactValueError}
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
    </Box>
  );
}
