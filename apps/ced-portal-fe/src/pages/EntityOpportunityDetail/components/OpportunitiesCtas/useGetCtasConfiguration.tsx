import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useDeleteOpportunityMutation,
  useOperatorCancelScheduledSuspensionMutation,
  useOperatorSuspendOpportunityMutation,
} from '../../../../features/opportunities/api';
import { useToast } from '../../../../contexts';
import { APP_ROUTES } from '../../../../app/routeConfig';
import type { OperatorDeleteOpportunityBody } from '../../../../core/api/generated/model';
import type {
  OpportunityStatus,
  SuspendOpportunityPayload,
} from '../../../../features/opportunities/types';
import { OpportunityStatusEnum } from '../../../../features/opportunities/types';
import { CTAS_BY_STATUS } from './constants';
import { OpportunitiesCtaItem, OpportunitiesCtasLayout } from './types';

const SUSPENSION_ACTION_STATES: Set<OpportunityStatus> = new Set([
  OpportunityStatusEnum.published,
  OpportunityStatusEnum.scheduled,
  OpportunityStatusEnum.test_pending,
]);

export const useGetCtasConfiguration = (
  id: string,
  status?: OpportunityStatus,
  suspendFrom?: string | null,
) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [deleteOpportunity] = useDeleteOpportunityMutation();
  const [suspendOpportunity] = useOperatorSuspendOpportunityMutation();
  const [cancelScheduledSuspension] =
    useOperatorCancelScheduledSuspensionMutation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  const canShowSuspendAction = Boolean(
    status && SUSPENSION_ACTION_STATES.has(status),
  );
  const hasScheduledSuspension =
    canShowSuspendAction && Boolean(suspendFrom?.trim());

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

  const handleConfirmSuspension = useCallback(
    async (payload: SuspendOpportunityPayload) => {
      try {
        await suspendOpportunity({ id, payload }).unwrap();
        showToast('Sospensione impostata con successo', 'success');
        setIsSuspendModalOpen(false);
      } catch {
        showToast("Errore durante la sospensione dell'opportunita", 'error');
      }
    },
    [id, showToast, suspendOpportunity],
  );

  const handleCloseSuspendModal = useCallback(() => {
    setIsSuspendModalOpen(false);
  }, []);

  const handleModify = useCallback(() => {
    navigate(APP_ROUTES.CREATE_BENEFIT, {
      state: { sourceOpportunityId: id },
    });
  }, [id, navigate]);

  const handleSuspension = useCallback(() => {
    setIsSuspendModalOpen(true);
  }, []);

  const handleCancelScheduledSuspension = useCallback(async () => {
    try {
      await cancelScheduledSuspension({ id }).unwrap();
      showToast('Sospensione pianificata annullata con successo', 'success');
    } catch {
      showToast(
        "Errore durante l'annullamento della sospensione pianificata",
        'error',
      );
    }
  }, [cancelScheduledSuspension, id, showToast]);

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
      CANCEL_SUSPENSION: handleCancelScheduledSuspension,
    }),
    [
      handleCancelScheduledSuspension,
      handleDelete,
      handleModify,
      handlePublication,
      handleSuspension,
    ],
  );

  const withActions = useCallback(
    (ctas?: OpportunitiesCtaItem[]) =>
      ctas?.map((cta) => ({
        ...cta,
        action: cta.actionId ? actionsMap[cta.actionId] : undefined,
      })),
    [actionsMap],
  );

  const ctasConfig = useMemo(() => {
    const mapped = Object.fromEntries(
      Object.entries(CTAS_BY_STATUS).map(([key, layout]) => {
        const mappedLayout = {
          ctas: withActions(layout?.ctas),
          leftCtas: withActions(layout?.leftCtas),
          rightCtas: withActions(layout?.rightCtas),
        } satisfies OpportunitiesCtasLayout;

        if (
          SUSPENSION_ACTION_STATES.has(key as OpportunityStatus) &&
          hasScheduledSuspension
        ) {
          return [
            key,
            {
              ...mappedLayout,
              rightCtas: mappedLayout.rightCtas?.map((cta) =>
                cta.actionId === 'SUSPEND'
                  ? {
                      ...cta,
                      label: 'Annulla sospensione programmata',
                      actionId: 'CANCEL_SUSPENSION',
                      action: actionsMap.CANCEL_SUSPENSION,
                    }
                  : cta,
              ),
            } satisfies OpportunitiesCtasLayout,
          ];
        }

        return [key, mappedLayout];
      }),
    ) as Partial<Record<OpportunityStatus, OpportunitiesCtasLayout>>;

    return mapped;
  }, [actionsMap.CANCEL_SUSPENSION, hasScheduledSuspension, withActions]);

  return {
    ctasConfig,
    deleteModal: {
      open: isDeleteModalOpen,
      onClose: handleCloseDeleteModal,
      onConfirm: handleConfirmDelete,
    },
    suspendModal: {
      open: isSuspendModalOpen,
      onClose: handleCloseSuspendModal,
      onConfirm: handleConfirmSuspension,
    },
  };
};
