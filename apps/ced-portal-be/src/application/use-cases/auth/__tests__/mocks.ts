import { ok } from "neverthrow";
import { vi } from "vitest";

import type { ArTokenRepository } from "../../../../domain/ports/outbound/ar-token.repository.js";
import type { SessionRepository } from "../../../../domain/ports/outbound/persistence/session.repository.js";

import { makeAcsUseCase } from "../acs.use-case.js";

// Fake verifier: the "token" is the JSON-serialised verified claims.
export const createFakeArTokenRepository = (): ArTokenRepository => ({
  verifyToken: vi.fn((token: string) =>
    Promise.resolve(ok(JSON.parse(token) as Record<string, unknown>)),
  ),
});

export const makeAcsUseCaseWithFakeVerifier = (
  sessionRepository: SessionRepository,
  operatorRepository: Parameters<typeof makeAcsUseCase>[2],
  config: Parameters<typeof makeAcsUseCase>[3],
) =>
  makeAcsUseCase(
    createFakeArTokenRepository(),
    sessionRepository,
    operatorRepository,
    config,
  );

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
