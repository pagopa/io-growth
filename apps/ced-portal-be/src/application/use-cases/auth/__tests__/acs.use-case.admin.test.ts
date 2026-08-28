import { hashUppercasedString } from "@pagopa/io-core-domain/utilities";
import { SignJWT } from "jose";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OperatorRepository } from "../../../../domain/ports/outbound/persistence/operator.repository.js";
import type { SessionRepository } from "../../../../domain/ports/outbound/persistence/session.repository.js";

import { makeAcsUseCase } from "../acs.use-case.js";

const makeToken = async (payload: Record<string, unknown>) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode("test-secret"));

const validPayload = {
  family_name: "Rossi",
  fiscal_number: "GDNNWA12H81Y874F",
  name: "Mario",
  organization: {
    fiscal_code: "org-vat",
    groups: ["internalGroupId-1"],
    id: "internalID",
    name: "Organization legal name",
    roles: [{ partyRole: "OPERATOR", role: "security" }],
  },
  uid: "uid_12345",
};

const createMockSessionRepository = (): SessionRepository => ({
  createOneTimeSessionId: vi.fn().mockResolvedValue(ok(undefined)),
  createSession: vi.fn().mockResolvedValue(ok(undefined)),
  getSession: vi.fn(),
  getSessionTokenByOneTimeId: vi.fn(),
});

const createMockOperatorRepository = (): OperatorRepository => ({
  create: vi.fn(),
  getByExternalId: vi.fn(),
  getById: vi.fn(),
});

describe("makeAcsUseCase — admin path", () => {
  it("should create admin session when fiscal_code hash is in ADMIN_FISCAL_CODES", async () => {
    const sessionRepository = createMockSessionRepository();
    const operatorRepository = createMockOperatorRepository();
    const adminConfig = {
      ADMIN_FISCAL_CODES: [
        hashUppercasedString(validPayload.organization.fiscal_code),
      ],
      ADMIN_FISCAL_CODES_TEST: [] as string[],
      OPERATORS_FISCAL_CODES_TEST: [] as string[],
    };
    const useCase = makeAcsUseCase(
      sessionRepository,
      operatorRepository,
      adminConfig,
    );
    const token = await makeToken(validPayload);

    const result = await useCase({ token });

    expect(result).toEqual(
      ok({ sessionId: expect.stringMatching(/^[a-f0-9]{64}$/) }),
    );
    expect(operatorRepository.create).not.toHaveBeenCalled();
    expect(operatorRepository.getByExternalId).not.toHaveBeenCalled();
    expect(sessionRepository.createSession).toHaveBeenCalledOnce();
    const [, session] = (
      sessionRepository.createSession as ReturnType<typeof vi.fn>
    ).mock.calls[0] as [string, { operatorId?: string; userType: string }];
    expect(session.userType).toBe("admin");
    expect(session.operatorId).toBeUndefined();
  });

  it("should create test_admin session when fiscal_code hash is in ADMIN_FISCAL_CODES_TEST", async () => {
    const sessionRepository = createMockSessionRepository();
    const operatorRepository = createMockOperatorRepository();
    const testAdminConfig = {
      ADMIN_FISCAL_CODES: [] as string[],
      ADMIN_FISCAL_CODES_TEST: [
        hashUppercasedString(validPayload.organization.fiscal_code),
      ],
      OPERATORS_FISCAL_CODES_TEST: [] as string[],
    };
    const useCase = makeAcsUseCase(
      sessionRepository,
      operatorRepository,
      testAdminConfig,
    );
    const token = await makeToken(validPayload);

    const result = await useCase({ token });

    expect(result).toEqual(
      ok({ sessionId: expect.stringMatching(/^[a-f0-9]{64}$/) }),
    );
    expect(operatorRepository.create).not.toHaveBeenCalled();
    expect(operatorRepository.getByExternalId).not.toHaveBeenCalled();
    const [, testAdminSession] = (
      sessionRepository.createSession as ReturnType<typeof vi.fn>
    ).mock.calls[0] as [string, { operatorId?: string; userType: string }];
    expect(testAdminSession.userType).toBe("test_admin");
    expect(testAdminSession.operatorId).toBeUndefined();
  });

  it("should create test_operator session when fiscal_code hash is in OPERATORS_FISCAL_CODES_TEST", async () => {
    const sessionRepository = createMockSessionRepository();
    const operatorRepository: OperatorRepository = {
      create: vi.fn(),
      getByExternalId: vi.fn().mockResolvedValue(
        ok({
          externalId: "internalID",
          id: "01JVMK3N8XQZP5T6G2WYHAB4CH",
          name: "Organization legal name",
          status: "active" as const,
        }),
      ),
      getById: vi.fn(),
    };
    const testOperatorConfig = {
      ADMIN_FISCAL_CODES: [] as string[],
      ADMIN_FISCAL_CODES_TEST: [] as string[],
      OPERATORS_FISCAL_CODES_TEST: [
        hashUppercasedString(validPayload.organization.fiscal_code),
      ],
    };
    const useCase = makeAcsUseCase(
      sessionRepository,
      operatorRepository,
      testOperatorConfig,
    );
    const token = await makeToken(validPayload);

    const result = await useCase({ token });

    expect(result).toEqual(
      ok({ sessionId: expect.stringMatching(/^[a-f0-9]{64}$/) }),
    );
    expect(operatorRepository.getByExternalId).toHaveBeenCalledWith(
      "internalID",
    );
    const [, testOperatorSession] = (
      sessionRepository.createSession as ReturnType<typeof vi.fn>
    ).mock.calls[0] as [string, { operatorId?: string; userType: string }];
    expect(testOperatorSession.userType).toBe("test_operator");
  });
});
