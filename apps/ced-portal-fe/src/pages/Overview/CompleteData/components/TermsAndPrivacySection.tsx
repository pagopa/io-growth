import { Paper, Stack, Typography } from '@mui/material';
import { PrivacyTipOutlined } from '@mui/icons-material';
import { AppTextField } from '../../../../components';
import { isValidHttpsUrl } from '../../../../utils/urlValidator';

type TermsAndPrivacySectionProps = {
  privacyUrl: string;
  termsUrl: string;
  onPrivacyUrlChange: (value: string) => void;
  onTermsUrlChange: (value: string) => void;
};

export const TermsAndPrivacySection = ({
  privacyUrl,
  termsUrl,
  onPrivacyUrlChange,
  onTermsUrlChange,
}: TermsAndPrivacySectionProps) => {
  const privacyUrlError =
    privacyUrl.trim().length > 0 && !isValidHttpsUrl(privacyUrl);

  const termsUrlError =
    termsUrl.trim().length > 0 && !isValidHttpsUrl(termsUrl);

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
          error={privacyUrlError}
          helperText={
            privacyUrlError
              ? 'Inserisci un URL valido (es. https://...)'
              : undefined
          }
          onChange={(e) => onPrivacyUrlChange(e.target.value)}
          fullWidth
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />

        <AppTextField
          label="Inserisci il link ai Termini e condizioni d’uso"
          placeholder="Inserisci il link ai Termini e condizioni d’uso"
          error={termsUrlError}
          helperText={
            termsUrlError
              ? 'Inserisci un URL valido (es. https://...)'
              : undefined
          }
          value={termsUrl}
          onChange={(e) => onTermsUrlChange(e.target.value)}
          fullWidth
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />
      </Stack>
    </Paper>
  );
};
