import { Box, Button, Typography } from '@mui/material';
import { IllusMIError } from '@pagopa/mui-italia';

const Unauthorized = () => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="60vh"
    gap={3}
    px={2}
    textAlign="center"
  >
    <IllusMIError />
    <Typography variant="h4" fontWeight={700}>
      Sessione scaduta
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Rieffettua l’accesso ad Area Riservata per utilizzare il portale
    </Typography>
    <Button
      variant="contained"
      color="primary"
      href="https://selfcare.pagopa.it"
    >
      Accedi ad Area Riservata
    </Button>
  </Box>
);

export default Unauthorized;
