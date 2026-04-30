import type { ReactNode } from 'react';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PhotoOutlined from '@mui/icons-material/PhotoOutlined';
import { italia } from '@pagopa/mui-italia';
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';

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
      selected={active}
      onClick={onClick}
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
  const { pathname } = useLocation();
  const navigate = useNavigate();

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
        <NavItem
          active={pathname === APP_ROUTES.HOME}
          icon={<BusinessOutlinedIcon />}
          label="Enti"
          onClick={() => navigate(APP_ROUTES.HOME)}
        />
        <NavItem
          active={pathname === APP_ROUTES.OPPORTUNITIES}
          icon={<PhotoOutlined />}
          label="Opportunità"
          onClick={() => navigate(APP_ROUTES.OPPORTUNITIES)}
        />
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
