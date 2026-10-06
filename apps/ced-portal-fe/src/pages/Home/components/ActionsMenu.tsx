import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { Menu, MenuItem, useTheme } from '@mui/material';
import { useCallback, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../app/routeConfig';
import { ModifyOpportunityModal } from '../../../components/ModifyOpportunityModal';
import { PublishModal } from '../../../components/PublishModal';
import type {
  OperatorDeleteOpportunityBody,
  OpportunitySummaryItemStatus,
  OpportunitySummaryItemSuspendedBy,
} from '../../../generated/model';
import {
  DeleteOpportunityModal,
  RepublishOpportunityActionModal,
  SuspendOpportunityModal,
} from './OpportunityActionModal';
import type {
  OperatorRepublishOpportunityPayload,
  SuspendOpportunityPayload,
} from '../../../features/opportunities/types';

type ActionsMenuProps = {
  anchor: null | HTMLElement;
  selectedItemId: string | null;
  selectedItemStatus?: OpportunitySummaryItemStatus | null;
  selectedItemSuspendFrom?: string | null;
  selectedItemSuspendedBy?: OpportunitySummaryItemSuspendedBy | null;
  selectedItemRepublishMessage?: string | null;
  handleMenuClose: () => void;
  onDeleteOpportunity: (
    id: string,
    payload?: OperatorDeleteOpportunityBody,
  ) => void;
  onSuspendOpportunity: (
    id: string,
    payload: SuspendOpportunityPayload,
  ) => void;
  onCancelScheduledSuspension: (id: string) => void;
  onRepublishOpportunity: (
    id: string,
    payload?: OperatorRepublishOpportunityPayload,
  ) => Promise<boolean>;
  isRepublishing: boolean;
};

export const ActionsMenu = ({
  anchor,
  selectedItemId,
  selectedItemStatus,
  selectedItemSuspendFrom,
  selectedItemSuspendedBy,
  selectedItemRepublishMessage,
  handleMenuClose,
  onDeleteOpportunity,
  onSuspendOpportunity,
  onCancelScheduledSuspension,
  onRepublishOpportunity,
  isRepublishing,
}: ActionsMenuProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isRepublishModalOpen, setIsRepublishModalOpen] = useState(false);

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

  const onEdit = () => {
    setIsModifyModalOpen(true);
  };

  const handleConfirmEdit = () => {
    if (!selectedItemId) {
      setIsModifyModalOpen(false);
      return;
    }

    setIsModifyModalOpen(false);
    navigate(APP_ROUTES.CREATE_BENEFIT, {
      state: { sourceOpportunityId: selectedItemId },
    });
  };

  const canDelete =
    selectedItemStatus === 'draft' ||
    selectedItemStatus === 'test_rejected' ||
    selectedItemStatus === 'suspended' ||
    selectedItemStatus === 'scheduled';
  const canEdit =
    selectedItemStatus === 'draft' ||
    selectedItemStatus === 'test_rejected' ||
    selectedItemStatus === 'test_passed' ||
    selectedItemStatus === 'scheduled' ||
    selectedItemStatus === 'published' ||
    selectedItemStatus === 'suspended';
  const canSuspend =
    selectedItemStatus === 'published' ||
    selectedItemStatus === 'scheduled_suspension';
  const hasScheduledSuspension = Boolean(selectedItemSuspendFrom?.trim());
  const canCancelScheduledSuspension =
    hasScheduledSuspension && selectedItemSuspendedBy === 'operator';
  const canOpenSuspendModal = canSuspend && !hasScheduledSuspension;
  const canRepublish =
    selectedItemStatus === 'suspended' &&
    (selectedItemSuspendedBy === 'operator' ||
      selectedItemSuspendedBy === 'department') &&
    !selectedItemRepublishMessage?.trim();
  const hasPendingRepublishRequest = Boolean(
    selectedItemRepublishMessage?.trim(),
  );

  const handleSuspend = useCallback(() => {
    if (!selectedItemId) {
      handleMenuClose();
      return;
    }

    if (canCancelScheduledSuspension) {
      onCancelScheduledSuspension(selectedItemId);
      handleMenuClose();
      return;
    }

    setIsSuspendModalOpen(true);
    handleMenuClose();
  }, [
    canCancelScheduledSuspension,
    handleMenuClose,
    onCancelScheduledSuspension,
    selectedItemId,
  ]);

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

  const handleCloseSuspendModal = useCallback(() => {
    setIsSuspendModalOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(
    (payload: OperatorDeleteOpportunityBody) => {
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

  const handleConfirmSuspend = useCallback(
    (payload: SuspendOpportunityPayload) => {
      if (!selectedItemId) {
        handleCloseSuspendModal();
        return;
      }

      onSuspendOpportunity(selectedItemId, payload);
      handleCloseSuspendModal();
    },
    [handleCloseSuspendModal, onSuspendOpportunity, selectedItemId],
  );

  const handleConfirmRepublish = useCallback(
    async (payload?: OperatorRepublishOpportunityPayload) => {
      if (!selectedItemId) {
        return false;
      }

      const succeeded = await onRepublishOpportunity(selectedItemId, payload);
      if (succeeded) {
        setIsRepublishModalOpen(false);
      }
      return succeeded;
    },
    [onRepublishOpportunity, selectedItemId],
  );

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
        {canEdit && (
          <>
            <MenuItem onClick={() => handleAction(onEdit)} sx={menuItemsSx}>
              Modifica
            </MenuItem>
          </>
        )}
        {canDelete && (
          <MenuItem onClick={() => handleAction(onDuplicate)} sx={menuItemsSx}>
            Duplica
          </MenuItem>
        )}
        {canOpenSuspendModal ? (
          <MenuItem onClick={handleSuspend} sx={menuItemsSx}>
            Sospendi
          </MenuItem>
        ) : null}
        {canCancelScheduledSuspension ? (
          <MenuItem onClick={handleSuspend} sx={menuItemsSx}>
            Annulla sospensione programmata
          </MenuItem>
        ) : null}
        {hasPendingRepublishRequest ? (
          <MenuItem disabled sx={menuItemsSx}>
            Richiesta di ripubblicazione inviata
          </MenuItem>
        ) : null}
        {canRepublish ? (
          <MenuItem
            onClick={() => {
              setIsRepublishModalOpen(true);
              handleMenuClose();
            }}
            sx={menuItemsSx}
          >
            Ripubblica
          </MenuItem>
        ) : null}

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
      <SuspendOpportunityModal
        open={isSuspendModalOpen}
        onClose={handleCloseSuspendModal}
        onConfirm={handleConfirmSuspend}
      />
      <ModifyOpportunityModal
        open={isModifyModalOpen}
        onClose={() => setIsModifyModalOpen(false)}
        onConfirm={handleConfirmEdit}
      />
      <PublishModal
        open={isRepublishModalOpen && selectedItemSuspendedBy === 'operator'}
        onClose={() => setIsRepublishModalOpen(false)}
        onPublish={handleConfirmRepublish}
        count={1}
        title="Ripubblica su IO"
        description="Invieremo un'email all'ente per informarlo. L'opportunità sarà di nuovo disponibile su IO."
        actionLabel="Conferma"
        isLoading={isRepublishing}
      />
      <RepublishOpportunityActionModal
        open={isRepublishModalOpen && selectedItemSuspendedBy === 'department'}
        onClose={() => setIsRepublishModalOpen(false)}
        onConfirm={handleConfirmRepublish}
        isLoading={isRepublishing}
      />
    </>
  );
};
