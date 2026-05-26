import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { Button, Menu, MenuItem, Stack, useTheme } from '@mui/material';
import { generatePath, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../app/routeConfig';
import { useCallback, useState } from 'react';
import { useRequestApprovalMutation } from '../../../features/opportunities/api';
import { useToast } from '../../../contexts';
import { AppModal } from '../../../components';
import { OpportunitySummaryItemStatus } from '../../../core/api/generated/model';

type ActionsMenuProps = {
  anchor: null | HTMLElement;
  selectedItemId: string | null;
  selectedItemStatus: keyof typeof OpportunitySummaryItemStatus | null;
  handleMenuClose: () => void;
};

export const ActionsMenu = ({
  anchor,
  selectedItemId,
  selectedItemStatus,
  handleMenuClose,
}: ActionsMenuProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [requestApproval] = useRequestApprovalMutation();
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  const menuItemsSx = {
    color: theme.palette.common.primaryButton,
  };

  const canRequestApproval =
    selectedItemStatus === OpportunitySummaryItemStatus.draft ||
    selectedItemStatus === OpportunitySummaryItemStatus.approval_pending;

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

  // const onDelete = async (id: string) => {
  // TODO[IEG-2722][SCOPE - RELEASE IN OCTOBER]: call delete opportunity API with { id }.
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

  const handleRequestApproval = async () => {
    if (!selectedItemId) return;
    setApprovalDialogOpen(false);
    handleMenuClose();
    try {
      await requestApproval(selectedItemId).unwrap();
      showToast('Richiesta di approvazione inviata con successo', 'success');
    } catch {
      showToast(
        "Errore durante l'invio della richiesta di approvazione",
        'error',
      );
    }
  };

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
        <MenuItem onClick={() => handleAction(onDuplicate)} sx={menuItemsSx}>
          Duplica
        </MenuItem>
        <MenuItem onClick={() => handleAction(onEdit)} sx={menuItemsSx}>
          Modifica
        </MenuItem>
        {canRequestApproval && (
          <MenuItem
            onClick={() => {
              setApprovalDialogOpen(true);
            }}
            sx={{ color: theme.palette.common.primaryButton, gap: 1 }}
          >
            <SendOutlinedIcon sx={{ fontSize: 18 }} />
            Richiedi approvazione
          </MenuItem>
        )}
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

      <AppModal
        open={approvalDialogOpen}
        onClose={() => {
          setApprovalDialogOpen(false);
          handleMenuClose();
        }}
        title="Richiedi approvazione"
        description="Il Dipartimento effettuerà la revisione della tua opportunità. Il processo potrebbe richiedere diverso tempo. Se approvata, sarà pubblicata su IO a partire dalla data di inizio validità che hai scelto."
      >
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() => {
              setApprovalDialogOpen(false);
              handleMenuClose();
            }}
          >
            Annulla
          </Button>
          <Button variant="contained" onClick={handleRequestApproval}>
            Invia in revisione
          </Button>
        </Stack>
      </AppModal>
    </>
  );
};
