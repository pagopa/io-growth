import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { AuditLogger, FimsSessionStore } from "../../domain/ports.js";
import type {
  FimsAuthFlowConfig,
  FimsSession,
  FimsUser,
} from "../../domain/types.js";
import type { OidcClient } from "../../oidc/oidc-client.js";

import { createHandleCallback } from "../handle-callback.use-case.js";
import { hashFiscalCode } from "../test-users.js";

const TEST_FISCAL_CODE = "RSSMRA80A01H501U";

const CONFIG: FimsAuthFlowConfig = {
  baseUrl: "https://browser.example.com",
  fimsRedirectUrl: "https://fims.example.com/fcb",
  idpKeysBaseUrl: "https://idp.example.com/keys",
  issuerUrl: "https://fims.example.com",
  otpTtlSeconds: 60,
  sessionTtlSeconds: 1800,
  testUsers: [hashFiscalCode(TEST_FISCAL_CODE)],
};

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

const makeMockAuditLogger = (): AuditLogger => ({
  logFimsExchange: vi.fn(() => Promise.resolve(ok(undefined))),
  logLollipopVerification: vi.fn(() => Promise.resolve(ok(undefined))),
});

const TEST_USER: FimsUser = {
  assertion: "<saml/>",
  assertion_ref: "sha256-abc",
  family_name: "Rossi",
  fiscal_code: TEST_FISCAL_CODE,
  given_name: "Mario",
  public_key: Buffer.from(JSON.stringify({ kty: "EC" })).toString("base64"),
};

describe("createHandleCallback", () => {
  it("returns UnauthorizedError when issuer does not match", async () => {
    const handleCallback = createHandleCallback(
      makeMockOidcClient(),
      makeMockSessionStore(),
      makeMockAuditLogger(),
      CONFIG,
    );
    const result = await handleCallback({
      code: "code",
      iss: "https://evil.example.com",
      state: "state",
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError);
  });

  it("returns UnauthorizedError when nonce not found", async () => {
    const sessionStore = makeMockSessionStore();
    vi.mocked(sessionStore.getTemporary).mockResolvedValue(ok(null));

    const handleCallback = createHandleCallback(
      makeMockOidcClient(),
      sessionStore,
      makeMockAuditLogger(),
      CONFIG,
    );
    const result = await handleCallback({
      code: "code",
      iss: CONFIG.issuerUrl,
      state: "state",
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError);
  });

  it("skips lollipop for test users and returns redirect URL", async () => {
    const sessionStore = makeMockSessionStore();
    const oidcClient = makeMockOidcClient();
    const auditLogger = makeMockAuditLogger();

    // First getTemporary call = nonce, subsequent = null (no device)
    vi.mocked(sessionStore.getTemporary)
      .mockResolvedValueOnce(ok("some-nonce"))
      .mockResolvedValue(ok(null));
    vi.mocked(oidcClient.exchangeCode).mockResolvedValue(ok(TEST_USER));

    const handleCallback = createHandleCallback(
      oidcClient,
      sessionStore,
      auditLogger,
      CONFIG,
    );
    const result = await handleCallback({
      code: "code",
      iss: CONFIG.issuerUrl,
      state: "state",
    });

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toContain(`${CONFIG.baseUrl}/authorize?id=`);
    expect(auditLogger.logLollipopVerification).not.toHaveBeenCalled();
  });
});
