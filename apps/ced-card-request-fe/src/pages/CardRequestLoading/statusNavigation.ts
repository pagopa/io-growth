import type { NavigateFunction } from 'react-router-dom';

import type { GetApplicationStatus200 } from '../../core/api/generated/model';
import { APP_ROUTES } from '../../app/routeConfig';

interface StatusNavigationDependencies {
  readonly getStatus: () => Promise<GetApplicationStatus200>;
  readonly navigate: NavigateFunction;
  readonly recoverDraft: () => Promise<void>;
  readonly resetDraft: () => void;
  readonly saveStatus: (status: GetApplicationStatus200) => void;
}

export const runStatusNavigation = async ({
  getStatus,
  navigate,
  recoverDraft,
  resetDraft,
  saveStatus,
}: StatusNavigationDependencies): Promise<void> => {
  const status = await getStatus();
  saveStatus(status);

  switch (status.state) {
    case 'READY_FOR_NEW_DRAFT':
      resetDraft();
      navigate(APP_ROUTES.APPLICATION, { replace: true });
      return;
    case 'READY_FOR_PHOTO_UPLOAD':
      await recoverDraft();
      navigate(APP_ROUTES.APPLICATION, {
        replace: true,
        state: { step: 2 },
      });
      return;
    case 'READY_FOR_DOCUMENTS_UPLOAD':
      await recoverDraft();
      navigate(APP_ROUTES.APPLICATION, {
        replace: true,
        state: { step: 3 },
      });
      return;
    case 'ACQUIRED':
      navigate(APP_ROUTES.REQUEST_SUCCESS, { replace: true });
      return;
    default:
      navigate(APP_ROUTES.GENERIC_ERROR, { replace: true });
  }
};
