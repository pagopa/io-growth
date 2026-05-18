import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../../app/routeConfig';
import { OpportunityDetail } from '../../../../features/opportunities/types';
import { CTAS_BY_STATUS } from './constants';
import { OpportunitiesCtaItem, OpportunitiesCtasLayout } from './types';

export const useGetCtasConfiguration = (id: string) => {
  const navigate = useNavigate();
  void id;

  const handleDelete = useCallback(() => {
    // TODO: call delete opportunity API with { id }
    navigate(APP_ROUTES.HOME);
  }, [navigate]);

  const handleModify = useCallback(() => {
    // TODO: confirm UX - inline edit or prefilled create page
    // TODO: include id when edit route is available
  }, []);

  const handleSuspention = useCallback(() => {
    // TODO: call suspend opportunity API with { id }
  }, []);

  const handlePublication = useCallback(() => {
    // TODO: call publish opportunity API with { id }
  }, []);

  const actionsMap: Record<
    NonNullable<OpportunitiesCtaItem['actionId']>,
    () => void
  > = useMemo(
    () => ({
      DELETE: handleDelete,
      MODIFY: handleModify,
      PUBLISH: handlePublication,
      SUSPENDE: handleSuspention,
    }),
    [handleDelete, handleModify, handlePublication, handleSuspention],
  );

  const withActions = useCallback(
    (ctas?: OpportunitiesCtaItem[]) =>
      ctas?.map((cta) => ({
        ...cta,
        action: cta.actionId ? actionsMap[cta.actionId] : undefined,
      })),
    [actionsMap],
  );

  return useMemo(
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
};
