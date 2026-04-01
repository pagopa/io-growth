import { italia } from '@pagopa/mui-italia';
import { Box } from '@mui/material';

import { MainContent } from './MainContent';
import {
  Footer,
  PageHeader,
  SideNavigation,
  TopUtilityBar,
} from '../../components';

export default function BenefitsPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: italia[50],
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopUtilityBar />
      <PageHeader />
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <SideNavigation />
        <MainContent />
      </Box>
      <Footer />
    </Box>
  );
}
