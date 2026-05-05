import type { FastifyRequest } from "fastify";

import { ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { createAuthenticationPreHandler } from "../authenticationPreHandler.js";
import { emptyValidator } from "../validator/httpInputStandardSchemaValidator.js";
import { withSession } from "../validator/withSession.js";

const mockSession = {
  firstName: "Mario",
  lastName: "Rossi",
  operatorId: "op-1",
};

const OperatorSessionSchema = z.object({ operatorId: z.string() });

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

  return { reply: reply as unknown as import("fastify").FastifyReply, state };
};

/**
 * Helper: creates a FastifyRequest with a valid session already stored by the
 * authentication preHandler (simulates what happens on authenticated routes).
 */
const createAuthenticatedRequest = async (
  session: Record<string, unknown>,
  overrides: Partial<FastifyRequest> = {},
): Promise<FastifyRequest> => {
  const resolver = vi.fn().mockResolvedValue(ok(session));
  const preHandler = createAuthenticationPreHandler(resolver);
  const { reply } = createReplyMock();

  const request = {
    headers: { authorization: "Bearer valid-token" },
    ...overrides,
  } as FastifyRequest;

  await preHandler(request, reply);
  return request;
};

describe("withSession", () => {
  it("should return session error when session validation fails", async () => {
    const request = { headers: {} } as FastifyRequest;
    const innerValidator = vi.fn().mockResolvedValue(ok({}));

    const validator = withSession(
      OperatorSessionSchema,
      innerValidator,
      (session) => session,
    );

    const result = await validator(request);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(innerValidator).not.toHaveBeenCalled();
  });

  it("should return inner validator error when inner validation fails", async () => {
    const request = await createAuthenticatedRequest(mockSession);
    const validationError = new ValidationError("body.name is required");
    const innerValidator = vi.fn().mockResolvedValue(err(validationError));

    const validator = withSession(
      OperatorSessionSchema,
      innerValidator,
      (session) => session,
    );

    const result = await validator(request);

    expect(result).toEqual(err(validationError));
  });

  it("should call buildInput with session and validated input when both succeed", async () => {
    const request = await createAuthenticatedRequest(mockSession);
    const innerOutput = { displayName: "Test", place: "Rome" };
    const innerValidator = vi.fn().mockResolvedValue(ok(innerOutput));

    const validator = withSession(
      OperatorSessionSchema,
      innerValidator,
      (session, input) => ({
        ...input,
        operatorId: session.operatorId,
      }),
    );

    const result = await validator(request);

    expect(result).toEqual(
      ok({
        displayName: "Test",
        operatorId: "op-1",
        place: "Rome",
      }),
    );
  });

  it("should work with emptyValidator for session-only endpoints", async () => {
    const request = await createAuthenticatedRequest(mockSession);

    const validator = withSession(
      OperatorSessionSchema,
      emptyValidator,
      (session) => ({ operatorId: session.operatorId }),
    );

    const result = await validator(request);

    expect(result).toEqual(ok({ operatorId: "op-1" }));
  });

  it("should pass the request to the inner validator", async () => {
    const request = await createAuthenticatedRequest(mockSession);
    const innerValidator = vi.fn().mockResolvedValue(ok({}));

    const validator = withSession(
      OperatorSessionSchema,
      innerValidator,
      (session) => session,
    );

    await validator(request);

    expect(innerValidator).toHaveBeenCalledWith(request);
  });
});
