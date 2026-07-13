import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteOpportunityMutation } from '../../../../features/opportunities/api';
import { useToast } from '../../../../contexts';
import { APP_ROUTES } from '../../../../app/routeConfig';
import type { OperatorDeleteOpportunityBody } from '../../../../core/api/generated/model';
import type { OpportunityStatus } from '../../../../features/opportunities/types';
import { CTAS_BY_STATUS } from './constants';
import { OpportunitiesCtaItem, OpportunitiesCtasLayout } from './types';

export const useGetCtasConfiguration = (
  id: string,
  status?: OpportunityStatus,
) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [deleteOpportunity] = useDeleteOpportunityMutation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleConfirmDelete = useCallback(
    async (payload?: OperatorDeleteOpportunityBody) => {
      try {
        await deleteOpportunity({ id, payload }).unwrap();
        showToast('Opportunità cancellata con successo', 'success');
        setIsDeleteModalOpen(false);
        navigate(APP_ROUTES.HOME);
      } catch {
        showToast("Errore durante l'eliminazione dell'opportunità", 'error');
      }
    },
    [deleteOpportunity, id, navigate, showToast],
  );

  const handleDelete = useCallback(() => {
    if (status !== 'draft') {
      setIsDeleteModalOpen(true);
    } else {
      handleConfirmDelete();
    }
  }, [handleConfirmDelete, status]);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handleModify = useCallback(() => {
    navigate(APP_ROUTES.CREATE_BENEFIT, {
      state: { sourceOpportunityId: id },
    });
  }, [id, navigate]);

  const handleSuspension = useCallback(() => {
    // TODO[IEG-2721][SCOPE - RELEASE IN OCTOBER]: call suspend opportunity API with { id }.
  }, []);

  const handlePublication = useCallback(() => {
    // TODO[OUT OF MVP SCOPE]: call publish opportunity API with { id }.
  }, []);

  const actionsMap: Record<
    NonNullable<OpportunitiesCtaItem['actionId']>,
    () => void
  > = useMemo(
    () => ({
      DELETE: handleDelete,
      MODIFY: handleModify,
      PUBLISH: handlePublication,
      SUSPEND: handleSuspension,
    }),
    [handleDelete, handleModify, handlePublication, handleSuspension],
  );

  const withActions = useCallback(
    (ctas?: OpportunitiesCtaItem[]) =>
      ctas?.map((cta) => ({
        ...cta,
        action: cta.actionId ? actionsMap[cta.actionId] : undefined,
      })),
    [actionsMap],
  );

  const ctasConfig = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(CTAS_BY_STATUS).map(([key, layout]) => [
          key,
          {
            ctas: withActions(layout?.ctas),
            leftCtas: withActions(layout?.leftCtas),
            rightCtas: withActions(layout?.rightCtas),
          } satisfies OpportunitiesCtasLayout,
        ]),
      ) as Partial<Record<OpportunityStatus, OpportunitiesCtasLayout>>,
    [withActions],
  );

  return {
    ctasConfig,
    deleteModal: {
      open: isDeleteModalOpen,
      onClose: handleCloseDeleteModal,
      onConfirm: handleConfirmDelete,
    },
  };
};
