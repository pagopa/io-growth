import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { ForbiddenError } from "@pagopa/io-core-domain/errors";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { FimsSessionStore } from "../../domain/ports.js";
import type { FimsAuthFlowConfig, FimsSession } from "../../domain/types.js";

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

describe("createTestSession", () => {
  it("returns ForbiddenError for non-test users", async () => {
    const useCase = createTestSession(makeMockSessionStore(), CONFIG);
    const result = await useCase({
      familyName: "Bianchi",
      fiscalCode: "UNKNOWN_FISCAL_CODE",
      givenName: "Luigi",
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(ForbiddenError);
  });

  it("returns a redirect URL for test users", async () => {
    const sessionStore = makeMockSessionStore();
    vi.mocked(sessionStore.getTemporary).mockResolvedValue(ok(null));

    const useCase = createTestSession(sessionStore, CONFIG);
    const result = await useCase({
      familyName: "Rossi",
      fiscalCode: TEST_FISCAL_CODE,
      givenName: "Mario",
    });

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toContain(`${CONFIG.baseUrl}/authorize?id=`);
  });
});
