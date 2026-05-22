import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../../app/routeConfig';
import { useRequestApprovalMutation } from '../../../../features/opportunities/api';
import { OpportunityDetail } from '../../../../features/opportunities/types';
import { useToast } from '../../../../contexts';
import { CTAS_BY_STATUS } from './constants';
import { OpportunitiesCtaItem, OpportunitiesCtasLayout } from './types';

export const useGetCtasConfiguration = (id: string) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [requestApproval] = useRequestApprovalMutation();
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);

  const handleDelete = useCallback(() => {
    // TODO[IEG-2722][SCOPE - RELEASE IN OCTOBER]: call delete opportunity API with { id }.
    navigate(APP_ROUTES.HOME);
  }, [id, navigate]);

  const handleModify = useCallback(() => {
    // TODO[IEG-2660][OUT OF MVP SCOPE]: confirm UX - inline edit or prefilled create page including { id }.
  }, [id]);

  const handleSuspension = useCallback(() => {
    // TODO[IEG-2721][SCOPE - RELEASE IN OCTOBER]: call suspend opportunity API with { id }.
  }, [id]);

  const handlePublication = useCallback(() => {
    // TODO[OUT OF MVP SCOPE]: call publish opportunity API with { id }.
  }, [id]);

  const handleRequestApproval = useCallback(async () => {
    setIsRequestingApproval(true);
    try {
      await requestApproval(id).unwrap();
      showToast('Richiesta di approvazione inviata con successo', 'success');
    } catch {
      showToast(
        "Errore durante l'invio della richiesta di approvazione",
        'error',
      );
    } finally {
      setIsRequestingApproval(false);
    }
  }, [id, requestApproval, showToast]);

  const actionsMap: Record<
    NonNullable<OpportunitiesCtaItem['actionId']>,
    () => void
  > = useMemo(
    () => ({
      DELETE: handleDelete,
      MODIFY: handleModify,
      PUBLISH: handlePublication,
      SUSPEND: handleSuspension,
      REQUEST_APPROVAL: handleRequestApproval,
    }),
    [
      handleDelete,
      handleModify,
      handlePublication,
      handleSuspension,
      handleRequestApproval,
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

  const ctasConfig = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(CTAS_BY_STATUS).map(([key, layout]) => [
          key,
          {
            ctas: withActions(layout.ctas),
            leftCtas: withActions(layout.leftCtas),
            rightCtas: withActions(layout.rightCtas),
          } satisfies OpportunitiesCtasLayout,
        ]),
      ) as Partial<
        Record<OpportunityDetail['publication_status'], OpportunitiesCtasLayout>
      >,
    [withActions],
  );

  return { ctasConfig, isRequestingApproval, handleRequestApproval };
};
