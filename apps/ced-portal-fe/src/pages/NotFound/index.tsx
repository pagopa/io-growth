import { Box, Button, Typography, useTheme } from '@mui/material';
import { IllusMIError } from '@pagopa/mui-italia';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/index.js';
import { selectUserType } from '../../core/auth/authSelectors.js';
import { APP_ROUTES } from '../../app/routeConfig.js';

const PageNotFound = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const userType = useAppSelector(selectUserType);

  const handleGoHome = () => {
    const isAdmin = userType === 'admin' || userType === 'test_admin';
    navigate(isAdmin ? APP_ROUTES.OPPORTUNITIES : APP_ROUTES.HOME);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
      bgcolor={theme.palette.common.neutralGray}
      gap={3}
      px={2}
      textAlign="center"
    >
      <IllusMIError />

      <Typography variant="h4" fontWeight={700}>
        Questa pagina non esiste
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Verifica che la URL utilizzata sia corretta e riprova.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleGoHome}>
        Vai alla homepage
      </Button>
    </Box>
  );
};

export default PageNotFound;
