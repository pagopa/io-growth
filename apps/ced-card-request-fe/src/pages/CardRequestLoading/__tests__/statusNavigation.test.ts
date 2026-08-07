import { describe, expect, it, vi } from 'vitest';

import type { GetApplicationStatus200 } from '../../../core/api/generated/model';

import { APP_ROUTES } from '../../../app/routeConfig';
import { runStatusNavigation } from '../statusNavigation';

const setup = (status: GetApplicationStatus200) => {
  const getStatus = vi.fn().mockResolvedValue(status);
  const navigate = vi.fn();
  const recoverDraft = vi.fn().mockResolvedValue(undefined);
  const saveStatus = vi.fn();

  return {
    dependencies: { getStatus, navigate, recoverDraft, saveStatus },
    getStatus,
    navigate,
    recoverDraft,
    saveStatus,
  };
};

describe('runStatusNavigation', () => {
  it('starts a new flow without recovering a draft for status 10', async () => {
    const { dependencies, navigate, recoverDraft, saveStatus } = setup({
      state: 'READY_FOR_NEW_DRAFT',
    });

    await runStatusNavigation(dependencies);

    expect(saveStatus).toHaveBeenCalledWith({
      state: 'READY_FOR_NEW_DRAFT',
    });
    expect(recoverDraft).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(APP_ROUTES.APPLICATION, {
      replace: true,
    });
  });

  it.each([
    ['READY_FOR_PHOTO_UPLOAD', 2],
    ['READY_FOR_DOCUMENTS_UPLOAD', 3],
  ] as const)(
    'recovers the draft before navigating for %s',
    async (state, step) => {
      const { dependencies, getStatus, navigate, recoverDraft } = setup({
        idLavorazione: '12345678901234567890',
        state,
      });

      await runStatusNavigation(dependencies);

      expect(recoverDraft).toHaveBeenCalledOnce();
      expect(getStatus.mock.invocationCallOrder[0]).toBeLessThan(
        recoverDraft.mock.invocationCallOrder[0],
      );
      expect(recoverDraft.mock.invocationCallOrder[0]).toBeLessThan(
        navigate.mock.invocationCallOrder[0],
      );
      expect(navigate).toHaveBeenCalledWith(APP_ROUTES.APPLICATION, {
        replace: true,
        state: { step },
      });
    },
  );
});
