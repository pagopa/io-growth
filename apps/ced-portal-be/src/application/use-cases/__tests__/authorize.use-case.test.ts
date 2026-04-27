import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { Session, SessionStore } from "../../ports/session-store.port.js";

import { makeAuthorizeUseCase } from "../authorize.use-case.js";

const createMockSessionStore = (): SessionStore => ({
  createOneTimeSessionId: vi.fn(),
  createSession: vi.fn(),
  getSession: vi.fn(),
  getSessionTokenByOneTimeId: vi.fn(),
});

describe("makeAuthorizeUseCase", () => {
  it("should return session data for a valid sessionId", async () => {
    const store = createMockSessionStore();
    const sessionToken = "a".repeat(64);
    const session: Session = { firstName: "Mario", lastName: "Rossi" };

    (
      store.getSessionTokenByOneTimeId as ReturnType<typeof vi.fn>
    ).mockResolvedValue(ok(sessionToken));
    (store.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(
      ok(session),
    );

    const useCase = makeAuthorizeUseCase(store);
    const result = await useCase({ query: { id: "some-session-id" } });

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      first_name: "Mario",
      last_name: "Rossi",
      sessionToken,
    });
  });

  it("should return NotFoundError when sessionId is expired or invalid", async () => {
    const store = createMockSessionStore();
    (
      store.getSessionTokenByOneTimeId as ReturnType<typeof vi.fn>
    ).mockResolvedValue(err(new NotFoundError("SessionId", "bad-id")));

    const useCase = makeAuthorizeUseCase(store);
    const result = await useCase({ query: { id: "bad-id" } });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("NotFoundError");
    expect(store.getSession).not.toHaveBeenCalled();
  });

  it("should return NotFoundError when session is not found for the token", async () => {
    const store = createMockSessionStore();
    const sessionToken = "b".repeat(64);

    (
      store.getSessionTokenByOneTimeId as ReturnType<typeof vi.fn>
    ).mockResolvedValue(ok(sessionToken));
    (store.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(
      err(new NotFoundError("Session", sessionToken)),
    );

    const useCase = makeAuthorizeUseCase(store);
    const result = await useCase({ query: { id: "some-id" } });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("NotFoundError");
  });
});
