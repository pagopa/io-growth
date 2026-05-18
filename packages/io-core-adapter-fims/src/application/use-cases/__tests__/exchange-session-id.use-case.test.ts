import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { FimsSession } from "../../../domain/entities.js";
import type { FimsSessionStore } from "../../../domain/ports/outbound/session.repository.js";

import { createExchangeSessionId } from "../exchange-session-id.use-case.js";

const makeMockSessionStore = (): FimsSessionStore => ({
  deleteTemporary: vi.fn(
    (): Promise<Result<void, BaseError>> => Promise.resolve(ok(undefined)),
  ),
  getSession: vi.fn(
    (): Promise<Result<FimsSession | null, BaseError>> =>
      Promise.resolve(ok(null)),
  ),
  getTemporary: vi.fn(
    (): Promise<Result<null | string, BaseError>> => Promise.resolve(ok(null)),
  ),
  storeSession: vi.fn(
    (): Promise<Result<void, BaseError>> => Promise.resolve(ok(undefined)),
  ),
  storeTemporary: vi.fn(
    (): Promise<Result<void, BaseError>> => Promise.resolve(ok(undefined)),
  ),
});

describe("createExchangeSessionId", () => {
  it("returns token and deletes the OTP on success", async () => {
    const sessionStore = makeMockSessionStore();
    vi.mocked(sessionStore.getTemporary).mockResolvedValue(
      ok("session-token-abc"),
    );

    const exchangeSessionId = createExchangeSessionId(sessionStore);
    const result = await exchangeSessionId({ sessionId: "some-session-id" });

    expect(result).toEqual(ok({ token: "session-token-abc" }));
    expect(sessionStore.deleteTemporary).toHaveBeenCalledOnce();
  });

  it("returns UnauthorizedError when OTP not found", async () => {
    const sessionStore = makeMockSessionStore();
    vi.mocked(sessionStore.getTemporary).mockResolvedValue(ok(null));

    const exchangeSessionId = createExchangeSessionId(sessionStore);
    const result = await exchangeSessionId({ sessionId: "bad-id" });

    expect(result).toEqual(err(expect.any(UnauthorizedError)));
  });
});
