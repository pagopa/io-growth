import { italia } from '@pagopa/mui-italia';
import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
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
  const showSideNavigation = pathname === APP_ROUTES.HOME;
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footerHeight, setFooterHeight] = useState(180);

  useEffect(() => {
    const footerNode = footerRef.current;
    if (!footerNode) {
      return;
    }

    const updateFooterHeight = () => {
      setFooterHeight(footerNode.getBoundingClientRect().height);
    };

    updateFooterHeight();
    const observer = new ResizeObserver(updateFooterHeight);
    observer.observe(footerNode);

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      sx={{
        height: '100dvh',
        bgcolor: italia[50],
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar + 2,
          bgcolor: 'background.paper',
        }}
      >
        <TopUtilityBar />
        <PageHeader />
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
          pt: { xs: '132px', md: '140px' },
          pb: `${footerHeight}px`,
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
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto' }}>
            <Outlet />
          </Box>
        )}
      </Box>
      <Box
        ref={footerRef}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (theme) => theme.zIndex.appBar + 1,
          bgcolor: 'background.paper',
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
}
