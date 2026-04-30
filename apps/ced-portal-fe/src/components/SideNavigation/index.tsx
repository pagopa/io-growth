import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PhotoOutlined from '@mui/icons-material/PhotoOutlined';
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { italia } from '@pagopa/mui-italia';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { selectUserRole } from '../../core/auth/authSelectors';
import { useAppSelector } from '../../hooks';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({
  active = false,
  icon,
  label,
  onClick,
}: Readonly<NavItemProps>) {
  return (
    <ListItemButton
      onClick={onClick}
      selected={active}
      sx={{
        minHeight: 64,
        px: { xs: 2, md: 3 },
        borderRight: active ? '4px solid' : '4px solid transparent',
        borderColor: active ? 'primary.main' : 'transparent',
        bgcolor: active ? italia[50] : 'transparent',
        '&.Mui-selected': {
          bgcolor: italia[50],
        },
        '&.Mui-selected:hover': {
          bgcolor: italia[100],
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 36,
          color: active ? 'primary.main' : 'text.primary',
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          fontWeight: active ? 700 : 600,
          color: active ? 'primary.main' : 'text.primary',
          display: { xs: 'none', md: 'block' },
        }}
      />
    </ListItemButton>
  );
}

export function SideNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isOverviewActive = pathname === APP_ROUTES.OVERVIEW;
  const isBenefitsActive = pathname === APP_ROUTES.HOME;
  const isOpportunitiesActive = pathname === APP_ROUTES.OPPORTUNITIES;
  const role = useAppSelector(selectUserRole);
  const isAdmin = role === 'admin';

  return (
    <Box
      component="aside"
      sx={{
        width: { xs: 88, md: 340 },
        height: '100%',
        bgcolor: 'common.white',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <List disablePadding sx={{ py: 2.5 }}>
        {isAdmin ? (
          <>
            <NavItem
              active={pathname === APP_ROUTES.HOME}
              icon={<BusinessOutlinedIcon />}
              label="Enti"
            />
            <NavItem
              active={pathname === APP_ROUTES.OPPORTUNITIES}
              icon={<PhotoOutlined />}
              label="Opportunità"
              onClick={() => navigate(APP_ROUTES.OPPORTUNITIES)}
            />
          </>
        ) : (
          <>
            <NavItem
              active={isOverviewActive}
              icon={<DashboardOutlinedIcon />}
              label="Panoramica"
              onClick={() => navigate(APP_ROUTES.OVERVIEW)}
            />
            <NavItem
              active={isBenefitsActive}
              icon={<LocalOfferOutlinedIcon />}
              label="Agevolazioni"
              onClick={() => navigate(APP_ROUTES.HOME)}
            />
          </>
        )}
      </List>

      <Box sx={{ p: 2 }}>
        <IconButton
          aria-label="Apri menu"
          sx={{
            color: 'primary.main',
            ml: { xs: 0, md: 0.5 },
          }}
        >
          <MenuRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
