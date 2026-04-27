import type { FastifyReply, FastifyRequest } from "fastify";

import { GenericError, ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { createHttpHandler } from "../httpHandlerBuilder.js";

const createReplyMock = () => {
  const state = {
    headers: {} as Record<string, string>,
    payload: undefined as unknown,
    redirectCode: undefined as number | undefined,
    redirectUrl: undefined as string | undefined,
    statusCode: undefined as number | undefined,
  };

  const reply = {
    code: (statusCode: number) => {
      state.statusCode = statusCode;
      return reply;
    },
    header: (name: string, value: string) => {
      state.headers[name] = value;
      return reply;
    },
    redirect: (url: string, code?: number) => {
      state.redirectUrl = url;
      state.redirectCode = code ?? 302;
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

const emptyRequest = {} as FastifyRequest;

describe("createHttpHandler", () => {
  describe("default JSON mode", () => {
    it("should return 200 with use case output", async () => {
      const useCase = vi.fn().mockResolvedValue(ok({ data: "hello" }));
      const validator = vi.fn().mockResolvedValue(ok({}));
      const { reply, state } = createReplyMock();

      const handler = createHttpHandler(useCase, validator);
      await handler(emptyRequest, reply);

      expect(state.statusCode).toBe(200);
      expect(state.payload).toEqual({ data: "hello" });
    });

    it("should use custom success code", async () => {
      const useCase = vi.fn().mockResolvedValue(ok({}));
      const validator = vi.fn().mockResolvedValue(ok({}));
      const { reply, state } = createReplyMock();

      const handler = createHttpHandler(useCase, validator, {
        successCode: 201,
      });
      await handler(emptyRequest, reply);

      expect(state.statusCode).toBe(201);
    });

    it("should return error response on validation failure", async () => {
      const useCase = vi.fn();
      const validator = vi
        .fn()
        .mockResolvedValue(err(new ValidationError("bad input")));
      const { reply, state } = createReplyMock();

      const handler = createHttpHandler(useCase, validator);
      await handler(emptyRequest, reply);

      expect(useCase).not.toHaveBeenCalled();
      expect(state.statusCode).toBe(400);
    });

    it("should return error response on use case failure", async () => {
      const useCase = vi.fn().mockResolvedValue(err(new GenericError("boom")));
      const validator = vi.fn().mockResolvedValue(ok({}));
      const { reply, state } = createReplyMock();

      const handler = createHttpHandler(useCase, validator);
      await handler(emptyRequest, reply);

      expect(state.statusCode).toBe(500);
    });
  });

  describe("redirect mode", () => {
    it("should redirect with 302 by default", async () => {
      const useCase = vi
        .fn()
        .mockResolvedValue(ok({ url: "/authorize?id=abc" }));
      const validator = vi.fn().mockResolvedValue(ok({}));
      const { reply, state } = createReplyMock();

      const handler = createHttpHandler(useCase, validator, {
        redirect: true,
      });
      await handler(emptyRequest, reply);

      expect(state.redirectUrl).toBe("/authorize?id=abc");
      expect(state.redirectCode).toBe(302);
    });

    it("should redirect with custom code", async () => {
      const useCase = vi.fn().mockResolvedValue(ok({ url: "/somewhere" }));
      const validator = vi.fn().mockResolvedValue(ok({}));
      const { reply, state } = createReplyMock();

      const handler = createHttpHandler(useCase, validator, {
        redirect: true,
        redirectCode: 307,
      });
      await handler(emptyRequest, reply);

      expect(state.redirectUrl).toBe("/somewhere");
      expect(state.redirectCode).toBe(307);
    });

    it("should return error response on validation failure in redirect mode", async () => {
      const useCase = vi.fn();
      const validator = vi
        .fn()
        .mockResolvedValue(err(new ValidationError("missing token")));
      const { reply, state } = createReplyMock();

      const handler = createHttpHandler(useCase, validator, {
        redirect: true,
      });
      await handler(emptyRequest, reply);

      expect(useCase).not.toHaveBeenCalled();
      expect(state.statusCode).toBe(400);
      expect(state.redirectUrl).toBeUndefined();
    });

    it("should return error response on use case failure in redirect mode", async () => {
      const useCase = vi
        .fn()
        .mockResolvedValue(err(new GenericError("store failed")));
      const validator = vi.fn().mockResolvedValue(ok({}));
      const { reply, state } = createReplyMock();

      const handler = createHttpHandler(useCase, validator, {
        redirect: true,
      });
      await handler(emptyRequest, reply);

      expect(state.statusCode).toBe(500);
      expect(state.redirectUrl).toBeUndefined();
    });
  });
});
