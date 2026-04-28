import { SignJWT } from "jose";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OperatorStore } from "../../ports/operator-store.port.js";
import type { SessionStore } from "../../ports/session-store.port.js";

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

const mockOperator = {
  id: "operator-uuid-123",
  name: "Organization legal name",
};

const createMockSessionStore = (): SessionStore => ({
  createOneTimeSessionId: vi.fn().mockResolvedValue(ok(undefined)),
  createSession: vi.fn().mockResolvedValue(ok(undefined)),
  getSession: vi.fn(),
  getSessionTokenByOneTimeId: vi.fn(),
});

const createMockOperatorStore = (
  existing?: undefined | { id: string; name: string },
): OperatorStore => ({
  create: vi.fn().mockResolvedValue(ok(mockOperator)),
  getByExternalId: vi.fn().mockResolvedValue(ok(existing)),
});

describe("makeAcsUseCase", () => {
  it("should retrieve existing operator, create a session and return a redirect URL", async () => {
    const sessionStore = createMockSessionStore();
    const operatorStore = createMockOperatorStore(mockOperator);
    const useCase = makeAcsUseCase(sessionStore, operatorStore);
    const token = await makeToken(validPayload);

    const result = await useCase({ query: { token } });

    expect(result).toEqual(
      ok({ url: expect.stringMatching(/^\/api\/authorize\?id=[a-f0-9]{64}$/) }),
    );

    expect(operatorStore.getByExternalId).toHaveBeenCalledWith("internalID");
    expect(operatorStore.create).not.toHaveBeenCalled();

    expect(sessionStore.createSession).toHaveBeenCalledOnce();
    const [sessionToken, session] = (
      sessionStore.createSession as ReturnType<typeof vi.fn>
    ).mock.calls[0] as [
      string,
      {
        firstName: string;
        lastName: string;
        operatorId: string;
        operatorName: string;
        referentExternalId: string;
        role: string;
      },
    ];
    expect(sessionToken).toHaveLength(64);
    expect(sessionToken).toMatch(/^[a-f0-9]{64}$/);
    expect(session).toEqual({
      firstName: "Mario",
      lastName: "Rossi",
      operatorId: "operator-uuid-123",
      operatorName: "Organization legal name",
      referentExternalId: "uid_12345",
      role: "OPERATOR",
    });

    expect(sessionStore.createOneTimeSessionId).toHaveBeenCalledOnce();
    const [sessionId, boundToken, ttl] = (
      sessionStore.createOneTimeSessionId as ReturnType<typeof vi.fn>
    ).mock.calls[0] as [string, string, number];
    expect(sessionId).toHaveLength(64);
    expect(sessionId).toMatch(/^[a-f0-9]{64}$/);
    expect(boundToken).toBe(sessionToken);
    expect(ttl).toBe(60);
  });

  it("should create operator when not found, then create session", async () => {
    const sessionStore = createMockSessionStore();
    const operatorStore = createMockOperatorStore(undefined);
    const useCase = makeAcsUseCase(sessionStore, operatorStore);
    const token = await makeToken(validPayload);

    const result = await useCase({ query: { token } });

    expect(result).toEqual(
      ok(expect.objectContaining({ url: expect.any(String) })),
    );

    expect(operatorStore.getByExternalId).toHaveBeenCalledWith("internalID");
    expect(operatorStore.create).toHaveBeenCalledWith({
      externalId: "internalID",
      name: "Organization legal name",
      status: "active",
    });

    const [, session] = (sessionStore.createSession as ReturnType<typeof vi.fn>)
      .mock.calls[0] as [string, { operatorId: string; operatorName: string }];
    expect(session.operatorId).toBe("operator-uuid-123");
    expect(session.operatorName).toBe("Organization legal name");
  });

  it("should return a ValidationError when the token payload is invalid", async () => {
    const sessionStore = createMockSessionStore();
    const operatorStore = createMockOperatorStore();
    const useCase = makeAcsUseCase(sessionStore, operatorStore);
    const token = await makeToken({ name: "Mario" }); // missing required fields

    const result = await useCase({ query: { token } });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(sessionStore.createSession).not.toHaveBeenCalled();
  });

  it("should propagate error when getByExternalId fails", async () => {
    const sessionStore = createMockSessionStore();
    const { GenericError } = await import("@pagopa/io-core-domain/errors");
    const operatorStore = createMockOperatorStore();
    (
      operatorStore.getByExternalId as ReturnType<typeof vi.fn>
    ).mockResolvedValue(
      (await import("neverthrow")).err(new GenericError("db down")),
    );
    const useCase = makeAcsUseCase(sessionStore, operatorStore);
    const token = await makeToken(validPayload);

    const result = await useCase({ query: { token } });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "GenericError" })),
    );
    expect(sessionStore.createSession).not.toHaveBeenCalled();
  });

  it("should propagate error when createSession fails", async () => {
    const sessionStore = createMockSessionStore();
    const operatorStore = createMockOperatorStore(mockOperator);
    const { GenericError } = await import("@pagopa/io-core-domain/errors");
    (sessionStore.createSession as ReturnType<typeof vi.fn>).mockResolvedValue(
      (await import("neverthrow")).err(new GenericError("redis down")),
    );
    const useCase = makeAcsUseCase(sessionStore, operatorStore);
    const token = await makeToken(validPayload);

    const result = await useCase({ query: { token } });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "GenericError" })),
    );
    expect(sessionStore.createOneTimeSessionId).not.toHaveBeenCalled();
  });

  it("should propagate error when createOneTimeSessionId fails", async () => {
    const sessionStore = createMockSessionStore();
    const operatorStore = createMockOperatorStore(mockOperator);
    const { GenericError } = await import("@pagopa/io-core-domain/errors");
    (
      sessionStore.createOneTimeSessionId as ReturnType<typeof vi.fn>
    ).mockResolvedValue(
      (await import("neverthrow")).err(new GenericError("redis down")),
    );
    const useCase = makeAcsUseCase(sessionStore, operatorStore);
    const token = await makeToken(validPayload);

    const result = await useCase({ query: { token } });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "GenericError" })),
    );
  });
});
