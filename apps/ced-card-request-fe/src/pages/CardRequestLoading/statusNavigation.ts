import type { NavigateFunction } from 'react-router-dom';

import type { StatusResponse } from '../../features/read-only-apis/api';
import { APP_ROUTES } from '../../app/routeConfig';

interface StatusNavigationDependencies {
  readonly getStatus: () => Promise<StatusResponse>;
  readonly navigate: NavigateFunction;
  readonly recoverDraft: () => Promise<void>;
  readonly resetDraft: (user: StatusResponse['user']) => void;
  readonly saveStatus: (status: StatusResponse) => void;
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
      resetDraft(status.user);
      navigate(APP_ROUTES.APPLICATION, { replace: true });
      return;
    case 'READY_FOR_PHOTO_UPLOAD':
      await recoverDraft();
      navigate(APP_ROUTES.APPLICATION, {
        replace: true,
        state: { step: 2, chooseDraft: true },
      });
      return;
    case 'READY_FOR_DOCUMENTS_UPLOAD':
      await recoverDraft();
      navigate(APP_ROUTES.APPLICATION, {
        replace: true,
        state: { step: 3, chooseDraft: true },
      });
      return;
    case 'ACQUIRED':
      navigate(APP_ROUTES.REQUEST_PENDING, { replace: true });
      return;
    default:
      navigate(APP_ROUTES.GENERIC_ERROR, {
        replace: true,
        state: { retry: true },
      });
  }
};
