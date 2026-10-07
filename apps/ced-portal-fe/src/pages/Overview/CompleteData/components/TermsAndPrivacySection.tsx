import { Paper, Stack, Typography } from '@mui/material';
import { PrivacyTipOutlined } from '@mui/icons-material';
import { AppTextField } from '../../../../components';

type TermsAndPrivacySectionProps = {
  privacyUrl: string;
  termsUrl: string;
  privacyUrlError?: string;
  termsUrlError?: string;
  onPrivacyUrlChange: (value: string) => void;
  onTermsUrlChange: (value: string) => void;
};

export const TermsAndPrivacySection = ({
  privacyUrl,
  termsUrl,
  privacyUrlError,
  termsUrlError,
  onPrivacyUrlChange,
  onTermsUrlChange,
}: TermsAndPrivacySectionProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, p: { xs: 1.5, md: 2 }, width: '100%' }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PrivacyTipOutlined
            sx={{ color: 'common.decorativeIcon', fontSize: 20 }}
          />
          <Typography fontWeight={600} fontSize={16} sx={{ lineHeight: 1.25 }}>
            Termini e privacy dei servizi erogati dall’ente
          </Typography>
        </Stack>

        <AppTextField
          label="Inserisci il link all’Informativa Privacy"
          placeholder="Inserisci il link all’Informativa Privacy"
          value={privacyUrl}
          required
          error={Boolean(privacyUrlError)}
          helperText={privacyUrlError}
          onChange={(e) => onPrivacyUrlChange(e.target.value)}
          fullWidth
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />

        <AppTextField
          label="Inserisci il link ai Termini e condizioni d’uso"
          placeholder="Inserisci il link ai Termini e condizioni d’uso"
          required
          error={Boolean(termsUrlError)}
          helperText={termsUrlError}
          value={termsUrl}
          onChange={(e) => onTermsUrlChange(e.target.value)}
          fullWidth
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />
      </Stack>
    </Paper>
  );
};
