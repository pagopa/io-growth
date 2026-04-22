import { italia } from '@pagopa/mui-italia';
import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import {
  Footer,
  PageHeader,
  SideNavigation,
  TopUtilityBar,
} from '../../components';

export function AppLayout() {
  const { pathname } = useLocation();
  const showSideNavigation =
    pathname === APP_ROUTES.HOME || pathname === APP_ROUTES.OVERVIEW;

  return (
    <Box
      sx={{
        height: '100dvh',
        bgcolor: italia[50],
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ bgcolor: 'background.paper', flexShrink: 0 }}>
        <TopUtilityBar />
        <PageHeader />
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {showSideNavigation ? (
          <>
            <Box sx={{ flexShrink: 0, minHeight: 0 }}>
              <SideNavigation />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto' }}>
              <Outlet />
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Footer />
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto' }}>
            <Outlet />
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Footer />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
