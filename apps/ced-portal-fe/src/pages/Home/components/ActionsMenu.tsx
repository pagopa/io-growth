import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { Menu, MenuItem, useTheme } from '@mui/material';
import { generatePath, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../app/routeConfig';
import { useCallback } from 'react';

type ActionsMenuProps = {
  anchor: null | HTMLElement;
  selectedItemId: string | null;
  handleMenuClose: () => void;
};

export const ActionsMenu = ({
  anchor,
  selectedItemId,
  handleMenuClose,
}: ActionsMenuProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const menuItemsSx = {
    color: theme.palette.common.primaryButton,
  };

  const onView = (id: string) => {
    console.log('🚀 ~ onView ~ id:', id);
    navigate(generatePath(APP_ROUTES.ENTE_OPPORTUNITY_DETAIL, { id }));
  };

  const onDuplicate = async (id: string) => {
    // const newOpportunity = await
    navigate(generatePath(APP_ROUTES.ENTE_OPPORTUNITY_DETAIL, { id }));
  };

  // const onEdit = (id: string) => {
  //   console.log('edit clicked');
  // };

  // const onSuspend = (id: string) => {
  //   console.log('suspend clicked');
  // };

  // const onDelete = (id: string) => {
  //   console.log('delete clicked');
  // };

  const handleAction = useCallback(
    (cb?: (id: string) => void) => {
      if (selectedItemId && cb) {
        cb(selectedItemId);
      }
      handleMenuClose();
    },
    [handleMenuClose, selectedItemId],
  );

  return (
    <Menu
      anchorEl={anchor}
      open={Boolean(anchor)}
      onClose={handleMenuClose}
      PaperProps={{
        sx: {
          minWidth: 220,
          borderRadius: 2,
          boxShadow: '0 6px 20px rgba(24, 39, 75, 0.18)',
        },
      }}
    >
      <MenuItem
        onClick={() => {
          handleAction(onView);
        }}
        sx={menuItemsSx}
      >
        Visualizza
      </MenuItem>
      <MenuItem onClick={() => handleAction(onDuplicate)} sx={menuItemsSx}>
        Duplica
      </MenuItem>
      <MenuItem onClick={() => handleAction(() => null)} sx={menuItemsSx}>
        Modifica
      </MenuItem>
      <MenuItem onClick={() => handleAction(() => null)} sx={menuItemsSx}>
        Sospendi
      </MenuItem>
      <MenuItem
        onClick={() => handleAction(() => null)}
        sx={{ color: theme.palette.error.main, gap: 1 }}
      >
        <CancelRoundedIcon sx={{ fontSize: 18 }} />
        Elimina
      </MenuItem>
    </Menu>
  );
};
