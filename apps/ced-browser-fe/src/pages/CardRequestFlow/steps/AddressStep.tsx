import { Box, Typography, useTheme } from '@mui/material';
import { AppSelect, AppTextField } from '../../../components';

export function AddressStep() {
  const theme = useTheme();

  return (
    <>
      <Typography
        variant="h3"
        component="h3"
        sx={{
          color: theme.palette.common.neutralBlack,
        }}
      >
        Dove vuoi ricevere la carta?
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: theme.palette.common.neutralDarkGray,
          fontSize: 17,
          lineHeight: 1.45,
        }}
      >
        Puoi indicare anche un indirizzo diverso da quello di residenza o
        domicilio.
      </Typography>

      <Box sx={{ mt: 3, display: 'grid', gap: 2.25 }}>
        <AppSelect label="Provincia" required options={[]} />
        <AppSelect label="Comune" required options={[]} />
        <AppSelect label="CAP" required options={[]} />
        <AppTextField label="Indirizzo" required />
        <AppTextField label="Civico" required />
        <AppTextField label="Altri dettagli" />
      </Box>
    </>
  );
}
