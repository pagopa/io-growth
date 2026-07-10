import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { Menu, MenuItem, useTheme } from '@mui/material';
import { useCallback, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../app/routeConfig';
import type { OpportunitySummaryItemStatus } from '../../../core/api/generated/model';
import { DeleteOpportunityModal } from './DeleteOpportunityModal';

type ActionsMenuProps = {
  anchor: null | HTMLElement;
  selectedItemId: string | null;
  selectedItemStatus?: OpportunitySummaryItemStatus | null;
  handleMenuClose: () => void;
  onDeleteOpportunity: (
    id: string,
    payload?: { reason: string; date: string },
  ) => void;
};

export const ActionsMenu = ({
  anchor,
  selectedItemId,
  selectedItemStatus,
  handleMenuClose,
  onDeleteOpportunity,
}: ActionsMenuProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const menuItemsSx = {
    color: theme.palette.common.primaryButton,
  };

  const onView = (id: string) => {
    navigate(generatePath(APP_ROUTES.ENTITY_OPPORTUNITY_DETAIL, { id }));
  };

  const onDuplicate = async (id: string) => {
    // TODO[IEG-2913][SCOPE MVP]: implement duplicate opportunity API with { id } and navigate to the created opportunity detail page.
    navigate(generatePath(APP_ROUTES.ENTITY_OPPORTUNITY_DETAIL, { id }));
  };

  const onEdit = async (id: string) => {
    navigate(APP_ROUTES.CREATE_BENEFIT, {
      state: { sourceOpportunityId: id },
    });
  };

  // const onSuspend = async (id: string) => {
  // TODO[IEG-2721][SCOPE - RELEASE IN OCTOBER]: call suspend opportunity API with { id }.
  // };

  const handleDelete = useCallback(() => {
    if (!selectedItemId) {
      handleMenuClose();
      return;
    }

    if (selectedItemStatus === 'draft') {
      onDeleteOpportunity(selectedItemId);
      handleMenuClose();
    } else {
      setIsDeleteModalOpen(true);
      handleMenuClose();
    }
  }, [
    handleMenuClose,
    selectedItemId,
    selectedItemStatus,
    onDeleteOpportunity,
  ]);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(
    (payload: { reason: string; date: string }) => {
      if (!selectedItemId) {
        handleCloseDeleteModal();
        return;
      }

      onDeleteOpportunity(selectedItemId, payload);
      handleCloseDeleteModal();
      navigate(APP_ROUTES.HOME);
    },
    [handleCloseDeleteModal, navigate, onDeleteOpportunity, selectedItemId],
  );

  const canDelete =
    selectedItemStatus === 'draft' ||
    selectedItemStatus === 'scheduled' ||
    selectedItemStatus === 'test_passed' ||
    selectedItemStatus === 'test_rejected' ||
    selectedItemStatus === 'suspended';

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
    <>
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
        {canDelete && (
          <>
            <MenuItem
              onClick={() => handleAction(onDuplicate)}
              sx={menuItemsSx}
            >
              Duplica
            </MenuItem>
            <MenuItem onClick={() => handleAction(onEdit)} sx={menuItemsSx}>
              Modifica
            </MenuItem>
          </>
        )}
        <MenuItem onClick={() => handleAction(() => null)} sx={menuItemsSx}>
          Sospendi
        </MenuItem>

        {canDelete && (
          <MenuItem
            onClick={handleDelete}
            sx={{ color: theme.palette.error.main, gap: 1 }}
          >
            <CancelRoundedIcon sx={{ fontSize: 18 }} />
            Elimina
          </MenuItem>
        )}
      </Menu>
      <DeleteOpportunityModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};
