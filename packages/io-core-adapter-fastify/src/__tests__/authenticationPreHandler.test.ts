import type { FastifyReply, FastifyRequest } from "fastify";

import { GenericError, NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  createAuthenticationPreHandler,
  getSessionFromRequest,
} from "../authenticationPreHandler.js";

const mockSession = {
  firstName: "Mario",
  lastName: "Rossi",
  operatorId: "op-1",
};

const MockSessionSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  operatorId: z.string(),
});

const createReplyMock = () => {
  const state = {
    headers: {} as Record<string, string>,
    payload: undefined as unknown,
    statusCode: undefined as number | undefined,
  };

  const reply = {
    header: (name: string, value: string) => {
      state.headers[name] = value;
      return reply;
    },
    send: (payload: unknown) => {
      state.payload = payload;
      return reply;
    },
    status: (statusCode: number) => {
      state.statusCode = statusCode;
      return reply;
    },
  };

  return {
    reply: reply as unknown as FastifyReply,
    state,
  };
};

describe("createAuthenticationPreHandler", () => {
  it("should return 401 when no Authorization header is present", async () => {
    const resolver = vi.fn();
    const preHandler = createAuthenticationPreHandler(resolver);
    const { reply, state } = createReplyMock();

    const request = { headers: {} } as FastifyRequest;
    await preHandler(request, reply);

    expect(state.statusCode).toBe(401);
    expect(state.payload).toEqual(
      expect.objectContaining({ title: "Unauthorized" }),
    );
    expect(resolver).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization header is not Bearer scheme", async () => {
    const resolver = vi.fn();
    const preHandler = createAuthenticationPreHandler(resolver);
    const { reply, state } = createReplyMock();

    const request = {
      headers: { authorization: "Basic abc123" },
    } as FastifyRequest;
    await preHandler(request, reply);

    expect(state.statusCode).toBe(401);
    expect(resolver).not.toHaveBeenCalled();
  });

  it("should return 401 when session resolver returns an error", async () => {
    const resolver = vi
      .fn()
      .mockResolvedValue(err(new NotFoundError("Session", "invalid-token")));
    const preHandler = createAuthenticationPreHandler(resolver);
    const { reply, state } = createReplyMock();

    const request = {
      headers: { authorization: "Bearer invalid-token" },
    } as FastifyRequest;
    await preHandler(request, reply);

    expect(state.statusCode).toBe(401);
    expect(resolver).toHaveBeenCalledWith("invalid-token");
  });

  it("should return 401 when session resolver throws a generic error", async () => {
    const resolver = vi
      .fn()
      .mockResolvedValue(err(new GenericError("redis down")));
    const preHandler = createAuthenticationPreHandler(resolver);
    const { reply, state } = createReplyMock();

    const request = {
      headers: { authorization: "Bearer some-token" },
    } as FastifyRequest;
    await preHandler(request, reply);

    expect(state.statusCode).toBe(401);
  });

  it("should store session on request and not send error when resolver succeeds", async () => {
    const resolver = vi.fn().mockResolvedValue(ok(mockSession));
    const preHandler = createAuthenticationPreHandler(resolver);
    const { reply, state } = createReplyMock();

    const request = {
      headers: { authorization: "Bearer valid-token" },
    } as FastifyRequest;
    await preHandler(request, reply);

    expect(state.statusCode).toBeUndefined();
    expect(state.payload).toBeUndefined();
    expect(resolver).toHaveBeenCalledWith("valid-token");

    const session = await getSessionFromRequest(request, MockSessionSchema);
    expect(session).toEqual(ok(mockSession));
  });

  it("should correctly extract token after 'Bearer ' prefix", async () => {
    const resolver = vi.fn().mockResolvedValue(ok(mockSession));
    const preHandler = createAuthenticationPreHandler(resolver);
    const { reply } = createReplyMock();

    const token = "abc123def456";
    const request = {
      headers: { authorization: `Bearer ${token}` },
    } as FastifyRequest;
    await preHandler(request, reply);

    expect(resolver).toHaveBeenCalledWith(token);
  });
});

describe("getSessionFromRequest", () => {
  it("should return ValidationError when session was not set", async () => {
    const request = { headers: {} } as FastifyRequest;
    const result = await getSessionFromRequest(request, MockSessionSchema);
    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
  });

  it("should return ValidationError when session does not match schema", async () => {
    const resolver = vi.fn().mockResolvedValue(ok({ unexpected: "data" }));
    const preHandler = createAuthenticationPreHandler(resolver);
    const { reply } = createReplyMock();

    const request = {
      headers: { authorization: "Bearer valid-token" },
    } as FastifyRequest;
    await preHandler(request, reply);

    const result = await getSessionFromRequest(request, MockSessionSchema);
    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
  });

  it("should extract only the fields defined in the schema", async () => {
    const resolver = vi
      .fn()
      .mockResolvedValue(
        ok({ ...mockSession, extraField: "should-be-stripped" }),
      );
    const preHandler = createAuthenticationPreHandler(resolver);
    const { reply } = createReplyMock();

    const request = {
      headers: { authorization: "Bearer valid-token" },
    } as FastifyRequest;
    await preHandler(request, reply);

    const PartialSchema = z.object({ operatorId: z.string() });
    const result = await getSessionFromRequest(request, PartialSchema);
    expect(result).toEqual(ok({ operatorId: "op-1" }));
  });
});
