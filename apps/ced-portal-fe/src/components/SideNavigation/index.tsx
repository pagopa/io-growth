import type { ReactNode } from 'react';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PlaceIcon from '@mui/icons-material/Place';
import { italia } from '@pagopa/mui-italia';
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

function NavItem({
  active = false,
  icon,
  label,
}: {
  active?: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <ListItemButton
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
  return (
    <Box
      component="aside"
      sx={{
        width: { xs: 88, md: 340 },
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
          active
          icon={<LocalOfferOutlinedIcon />}
          label="Agevolazioni"
        />
        <NavItem icon={<PlaceIcon />} label="Punti di accesso" />
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
