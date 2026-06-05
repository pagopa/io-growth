import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../app/routeConfig';
import { useAppDispatch } from '../../../hooks';
import { resetForm } from '../../../features/opportunityCreation/opportunityCreationSlice';

export function MainContentHeader() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const handleCreateOpportunity = () => {
    dispatch(resetForm());
    navigate(APP_ROUTES.CREATE_BENEFIT);
  };

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
    >
      <Box>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: 36, md: 44 }, fontWeight: 700 }}
        >
          Opportunità
        </Typography>
        <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 18 }}>
          Crea e gestisci le tue opportunità.
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<AddIcon />}
        onClick={handleCreateOpportunity}
        sx={{
          borderRadius: 2,
          px: 3,
          fontSize: 16,
          fontWeight: 700,
          alignSelf: { xs: 'stretch', md: 'auto' },
        }}
      >
        Crea opportunità
      </Button>
    </Stack>
  );
}
