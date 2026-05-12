import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { FimsSessionStore } from "../../domain/ports.js";
import type { FimsSession } from "../../domain/types.js";
import type { OidcClient } from "../../oidc/oidc-client.js";

import { createInitiateAuth } from "../initiate-auth.use-case.js";

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

const makeMockOidcClient = (): OidcClient => ({
  exchangeCode: vi.fn(),
  getAuthorizationUrl: vi.fn(),
});

const CONFIG = { otpTtlSeconds: 60 };

describe("createInitiateAuth", () => {
  it("stores nonce and returns authorisation URL", async () => {
    const sessionStore = makeMockSessionStore();
    const oidcClient = makeMockOidcClient();
    const authUrl = "https://fims.example.com/auth?state=abc&nonce=xyz";
    vi.mocked(oidcClient.getAuthorizationUrl).mockResolvedValue(ok(authUrl));

    const initiateAuth = createInitiateAuth(oidcClient, sessionStore, CONFIG);
    const result = await initiateAuth({});

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(authUrl);
    expect(sessionStore.storeTemporary).toHaveBeenCalledOnce();
  });

  it("also stores device when provided", async () => {
    const sessionStore = makeMockSessionStore();
    const oidcClient = makeMockOidcClient();
    vi.mocked(oidcClient.getAuthorizationUrl).mockResolvedValue(
      ok("https://fims.example.com"),
    );

    const initiateAuth = createInitiateAuth(oidcClient, sessionStore, CONFIG);
    await initiateAuth({ device: "mobile" });

    expect(sessionStore.storeTemporary).toHaveBeenCalledTimes(2);
  });

  it("propagates storeTemporary error", async () => {
    const sessionStore = makeMockSessionStore();
    const oidcClient = makeMockOidcClient();
    vi.mocked(sessionStore.storeTemporary).mockResolvedValue(
      err(new GenericError("redis error")),
    );

    const initiateAuth = createInitiateAuth(oidcClient, sessionStore, CONFIG);
    const result = await initiateAuth({});

    expect(result.isErr()).toBe(true);
  });
});
