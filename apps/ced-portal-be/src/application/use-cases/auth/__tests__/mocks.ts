import { ok } from "neverthrow";
import { vi } from "vitest";

import type { SessionRepository } from "../../../../domain/ports/outbound/persistence/session.repository.js";

export const createMockSessionRepository = (
  overrides: Partial<SessionRepository> = {},
): SessionRepository => ({
  createOneTimeSessionId:
    overrides.createOneTimeSessionId ??
    vi.fn().mockResolvedValue(ok(undefined)),
  createSession:
    overrides.createSession ?? vi.fn().mockResolvedValue(ok(undefined)),
  // Default to "not revoked": the revocation tombstone is the exception, and
  // every pre-existing test assumes an operator that can still authenticate.
  existsRevocationByOperatorExternalId:
    overrides.existsRevocationByOperatorExternalId ??
    vi.fn().mockResolvedValue(ok(false)),
  getSession: overrides.getSession ?? vi.fn(),
  getSessionTokenByOneTimeId: overrides.getSessionTokenByOneTimeId ?? vi.fn(),
  revokeByOperatorExternalId:
    overrides.revokeByOperatorExternalId ??
    vi.fn().mockResolvedValue(ok(undefined)),
});
