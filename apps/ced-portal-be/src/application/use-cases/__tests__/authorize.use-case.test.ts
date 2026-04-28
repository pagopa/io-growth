import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { Session } from "../../../domain/entities/session.js";
import type { SessionRepository } from "../../../domain/ports/outbound/persistence/session.repository.js";

import { makeAuthorizeUseCase } from "../authorize.use-case.js";

const createMockSessionRepository = (): SessionRepository => ({
  createOneTimeSessionId: vi.fn(),
  createSession: vi.fn(),
  getSession: vi.fn(),
  getSessionTokenByOneTimeId: vi.fn(),
});

describe("makeAuthorizeUseCase", () => {
  it("should return session data for a valid sessionId", async () => {
    const sessionRepository = createMockSessionRepository();
    const sessionToken = "a".repeat(64);
    const session: Session = {
      firstName: "Mario",
      lastName: "Rossi",
      operatorId: "op-id",
      operatorName: "Op Name",
      referentExternalId: "ref-id",
      role: "OPERATOR",
    };

    (
      sessionRepository.getSessionTokenByOneTimeId as ReturnType<typeof vi.fn>
    ).mockResolvedValue(ok(sessionToken));
    (
      sessionRepository.getSession as ReturnType<typeof vi.fn>
    ).mockResolvedValue(ok(session));

    const useCase = makeAuthorizeUseCase(sessionRepository);
    const result = await useCase({ query: { id: "some-session-id" } });

    expect(result).toEqual(
      ok({
        first_name: "Mario",
        last_name: "Rossi",
        operator_name: "Op Name",
        session_token: sessionToken,
      }),
    );
  });

  it("should return NotFoundError when sessionId is expired or invalid", async () => {
    const sessionRepository = createMockSessionRepository();
    (
      sessionRepository.getSessionTokenByOneTimeId as ReturnType<typeof vi.fn>
    ).mockResolvedValue(err(new NotFoundError("SessionId", "bad-id")));

    const useCase = makeAuthorizeUseCase(sessionRepository);
    const result = await useCase({ query: { id: "bad-id" } });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(sessionRepository.getSession).not.toHaveBeenCalled();
  });

  it("should return NotFoundError when session is not found for the token", async () => {
    const sessionRepository = createMockSessionRepository();
    const sessionToken = "b".repeat(64);

    (
      sessionRepository.getSessionTokenByOneTimeId as ReturnType<typeof vi.fn>
    ).mockResolvedValue(ok(sessionToken));
    (
      sessionRepository.getSession as ReturnType<typeof vi.fn>
    ).mockResolvedValue(err(new NotFoundError("Session", sessionToken)));

    const useCase = makeAuthorizeUseCase(sessionRepository);
    const result = await useCase({ query: { id: "some-id" } });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
  });
});
