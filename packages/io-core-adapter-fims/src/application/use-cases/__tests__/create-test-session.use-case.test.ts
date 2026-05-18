import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { ForbiddenError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type {
  FimsAuthFlowConfig,
  FimsSession,
} from "../../../domain/entities.js";
import type { AuditLogger } from "../../../domain/ports/outbound/audit-logger.repository.js";
import type { FimsSessionStore } from "../../../domain/ports/outbound/session.repository.js";

import { createTestSession } from "../create-test-session.use-case.js";
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

const makeMockAuditLogger = (): AuditLogger => ({
  logFimsExchange: vi.fn(() => Promise.resolve(ok(undefined))),
  logLollipopVerification: vi.fn(() => Promise.resolve(ok(undefined))),
  logTestSession: vi.fn(() => Promise.resolve(ok(undefined))),
});

describe("createTestSession", () => {
  it("returns ForbiddenError for non-test users", async () => {
    const useCase = createTestSession(
      makeMockSessionStore(),
      makeMockAuditLogger(),
      CONFIG,
    );
    const result = await useCase({
      familyName: "Bianchi",
      fiscalCode: "UNKNOWN_FISCAL_CODE",
      givenName: "Luigi",
    });

    expect(result).toEqual(err(expect.any(ForbiddenError)));
  });

  it("returns a redirect URL for test users and logs the test session", async () => {
    const sessionStore = makeMockSessionStore();
    const auditLogger = makeMockAuditLogger();
    vi.mocked(sessionStore.getTemporary).mockResolvedValue(ok(null));

    const useCase = createTestSession(sessionStore, auditLogger, CONFIG);
    const result = await useCase({
      familyName: "Rossi",
      fiscalCode: TEST_FISCAL_CODE,
      givenName: "Mario",
    });

    expect(result).toEqual(
      ok(expect.stringContaining(`${CONFIG.baseUrl}/authorize?id=`)),
    );
    expect(auditLogger.logTestSession).toHaveBeenCalledWith({
      fiscalCode: TEST_FISCAL_CODE,
    });
  });

  it("returns error when logTestSession audit fails", async () => {
    const sessionStore = makeMockSessionStore();
    const auditLogger = makeMockAuditLogger();
    vi.mocked(auditLogger.logTestSession).mockResolvedValue(
      err(new ForbiddenError()),
    );

    const useCase = createTestSession(sessionStore, auditLogger, CONFIG);
    const result = await useCase({
      familyName: "Rossi",
      fiscalCode: TEST_FISCAL_CODE,
      givenName: "Mario",
    });

    expect(result).toEqual(err(expect.any(ForbiddenError)));
  });
});
