import { SignJWT } from "jose";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

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

const createMockSessionStore = (): SessionStore => ({
  createOneTimeSessionId: vi.fn().mockResolvedValue(ok(undefined)),
  createSession: vi.fn().mockResolvedValue(ok(undefined)),
  getSession: vi.fn(),
  getSessionTokenByOneTimeId: vi.fn(),
});

describe("makeAcsUseCase", () => {
  it("should create a session and return a redirect URL", async () => {
    const store = createMockSessionStore();
    const useCase = makeAcsUseCase(store);
    const token = await makeToken(validPayload);

    const result = await useCase({ query: { token } });

    expect(result.isOk()).toBe(true);

    const output = result._unsafeUnwrap();
    expect(output.url).toMatch(/^\/authorize\?id=[a-f0-9]{64}$/);

    expect(store.createSession).toHaveBeenCalledOnce();
    const [sessionToken, session] = (
      store.createSession as ReturnType<typeof vi.fn>
    ).mock.calls[0] as [
      string,
      {
        firstName: string;
        lastName: string;
        organizationExternalId: string;
        referentExternalId: string;
        role: string;
      },
    ];
    expect(sessionToken).toHaveLength(64);
    expect(sessionToken).toMatch(/^[a-f0-9]{64}$/);
    expect(session).toEqual({
      firstName: "Mario",
      lastName: "Rossi",
      organizationExternalId: "internalID",
      referentExternalId: "uid_12345",
      role: "OPERATOR",
    });

    expect(store.createOneTimeSessionId).toHaveBeenCalledOnce();
    const [sessionId, boundToken, ttl] = (
      store.createOneTimeSessionId as ReturnType<typeof vi.fn>
    ).mock.calls[0] as [string, string, number];
    expect(sessionId).toHaveLength(64);
    expect(sessionId).toMatch(/^[a-f0-9]{64}$/);
    expect(boundToken).toBe(sessionToken);
    expect(ttl).toBe(60);
  });

  it("should return a ValidationError when the token payload is invalid", async () => {
    const store = createMockSessionStore();
    const useCase = makeAcsUseCase(store);
    const token = await makeToken({ name: "Mario" }); // missing required fields

    const result = await useCase({ query: { token } });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("ValidationError");
    expect(store.createSession).not.toHaveBeenCalled();
  });

  it("should propagate error when createSession fails", async () => {
    const store = createMockSessionStore();
    const { GenericError } = await import("@pagopa/io-core-domain/errors");
    (store.createSession as ReturnType<typeof vi.fn>).mockResolvedValue(
      (await import("neverthrow")).err(new GenericError("redis down")),
    );
    const useCase = makeAcsUseCase(store);
    const token = await makeToken(validPayload);

    const result = await useCase({ query: { token } });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
    expect(store.createOneTimeSessionId).not.toHaveBeenCalled();
  });

  it("should propagate error when createOneTimeSessionId fails", async () => {
    const store = createMockSessionStore();
    const { GenericError } = await import("@pagopa/io-core-domain/errors");
    (
      store.createOneTimeSessionId as ReturnType<typeof vi.fn>
    ).mockResolvedValue(
      (await import("neverthrow")).err(new GenericError("redis down")),
    );
    const useCase = makeAcsUseCase(store);
    const token = await makeToken(validPayload);

    const result = await useCase({ query: { token } });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
  });
});
