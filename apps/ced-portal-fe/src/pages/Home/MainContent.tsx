import { Box, Stack, useTheme } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { useBenefitsData } from '../../features/benefits/hooks';
import { BenefitsContentState } from './components/BenefitsContentState';
import { BenefitsFiltersBar } from './components/BenefitsFiltersBar';
import { BenefitsTabs } from './components/BenefitsTabs';
import { MainContentHeader } from './components/MainContentHeader';

export const MainContent = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const { inManagementItems, approvedItems, isLoading, isError, refetch } =
    useBenefitsData();

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const displayedItems = activeTab === 0 ? inManagementItems : approvedItems;
  return (
    <Box
      sx={{
        minHeight: '100%',
        px: { xs: 2, md: 3.5 },
        py: { xs: 3, md: 4.5 },
      }}
      bgcolor={theme.palette.common.neutralGray}
    >
      <Stack spacing={3} sx={{ minHeight: '100%' }}>
        <MainContentHeader />
        <BenefitsFiltersBar />

        <Box>
          <BenefitsTabs activeTab={activeTab} onChange={handleTabChange} />
          <BenefitsContentState
            isLoading={isLoading}
            isError={isError}
            items={displayedItems}
            activeTab={activeTab}
            onRetry={refetch}
          />
        </Box>
      </Stack>
    </Box>
  );
};
