import { Paper, Stack, Typography, TextField } from '@mui/material';
import { PrivacyTipOutlined } from '@mui/icons-material';

export const TermsAndPrivacySection = () => (
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
          Termini e Privacy
        </Typography>
      </Stack>
      <TextField
        fullWidth
        label="Inserisci il link all’Informativa sulla privacy dell’ente relativa all’opportunità"
        placeholder="Inserisci il link all’Informativa sulla privacy dell’ente relativa all’opportunità"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
      />
      <TextField
        fullWidth
        label="Inserisci il link ai Termini e condizioni d’uso applicabili all’opportunità"
        placeholder="Inserisci il link ai Termini e condizioni d’uso applicabili all’opportunità"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
      />
    </Stack>
  </Paper>
);
