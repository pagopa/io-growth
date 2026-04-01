import AddIcon from '@mui/icons-material/Add';
import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { useBenefitsData } from '../../features/benefits/hooks';
import { BenefitsTable } from './components/BenefitsTable';

const statusOptions = ['Attiva', 'Bozza', 'Scaduta'];

export const MainContent = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const { inManagementItems, approvedItems, isLoading, isError, refetch } =
    useBenefitsData();

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const displayedItems = activeTab === 0 ? inManagementItems : approvedItems;
  const hasData = !isLoading && !isError && displayedItems.length > 0;

  return (
    <Box
      sx={{ flex: 1, px: { xs: 2, md: 3.5 }, py: { xs: 3, md: 4.5 } }}
      bgcolor={theme.palette.common.neutralGray}
    >
      <Stack spacing={3}>
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
              Agevolazioni
            </Typography>
            <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 18 }}>
              Crea e gestisci le tue agevolazioni.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              fontSize: 16,
              fontWeight: 700,
              alignSelf: { xs: 'stretch', md: 'auto' },
            }}
          >
            Crea agevolazione
          </Button>
        </Stack>

        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', lg: 'center' }}
        >
          <TextField
            fullWidth
            placeholder="Cerca per nome"
            sx={{
              maxWidth: 550,
              bgcolor: 'common.white',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                minHeight: 56,
              },
            }}
          />

          <Select
            displayEmpty
            defaultValue=""
            renderValue={(value) => (value === '' ? 'Categoria' : value)}
            sx={{
              minWidth: { xs: '100%', lg: 160 },
              maxWidth: { xs: '100%', lg: 160 },
              bgcolor: 'common.white',
              borderRadius: 2,
              minHeight: 56,
            }}
          >
            <MenuItem value="">Stato</MenuItem>
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>

          <Select
            displayEmpty
            defaultValue=""
            renderValue={(value) => (value === '' ? 'Stato' : value)}
            sx={{
              minWidth: { xs: '100%', lg: 160 },
              maxWidth: { xs: '100%', lg: 160 },
              bgcolor: 'common.white',
              borderRadius: 2,
              minHeight: 56,
            }}
          >
            <MenuItem value="">Stato</MenuItem>
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>

          <Stack
            direction="row"
            spacing={2.5}
            alignItems="center"
            sx={{ pl: { lg: 1 } }}
          >
            <Button
              variant="text"
              startIcon={<FilterAltOutlined />}
              sx={{ fontWeight: 700, fontSize: 16, px: 0.5 }}
            >
              Filtra
            </Button>
            <Button
              variant="text"
              sx={{ fontWeight: 700, fontSize: 16, px: 0.5 }}
            >
              Rimuovi filtri
            </Button>
          </Stack>
        </Stack>

        <Box>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ width: '100%' }}
          >
            <Tab
              label={
                <Typography
                  variant="h6"
                  color={
                    activeTab === 0
                      ? theme.palette.common.primaryButton
                      : theme.palette.text.secondary
                  }
                >
                  In gestione
                </Typography>
              }
              sx={{ maxWidth: 'none' }}
            />
            <Tab
              label={
                <Typography
                  variant="h6"
                  color={
                    activeTab === 1
                      ? theme.palette.common.primaryButton
                      : theme.palette.text.secondary
                  }
                >
                  Approvate
                </Typography>
              }
              sx={{ maxWidth: 'none' }}
            />
          </Tabs>

          <Paper
            elevation={0}
            sx={{
              mt: 2,
              borderRadius: 2.5,
              border: '8px solid',
              borderColor: theme.palette.divider,
              bgcolor: 'common.white',
              minHeight: 164,
              display: hasData ? 'block' : 'grid',
              placeItems: hasData ? 'normal' : 'center',
              // px: 3,
            }}
          >
            {isLoading ? (
              <Stack spacing={1} alignItems="center" textAlign="center">
                <CircularProgress size={28} />
                <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>
                  Caricamento agevolazioni...
                </Typography>
              </Stack>
            ) : isError ? (
              <Stack spacing={1.5} alignItems="center" textAlign="center">
                <WarningAmberRoundedIcon
                  sx={{ color: 'text.secondary', fontSize: 28 }}
                />
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'text.secondary',
                  }}
                >
                  Errore durante il caricamento
                </Typography>
                <Button variant="text" onClick={() => refetch()}>
                  Riprova
                </Button>
              </Stack>
            ) : displayedItems.length === 0 ? (
              <Stack spacing={1} alignItems="center" textAlign="center">
                <WarningAmberRoundedIcon
                  sx={{ color: 'text.secondary', fontSize: 28 }}
                />
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'text.secondary',
                  }}
                >
                  Non ci sono elementi da mostrare
                </Typography>
                <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>
                  {activeTab === 0
                    ? 'Qui vedrai le agevolazioni in gestione.'
                    : 'Qui vedrai le agevolazioni approvate.'}
                </Typography>
              </Stack>
            ) : (
              <BenefitsTable items={displayedItems} />
            )}
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};
