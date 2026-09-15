import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import Fastify from "fastify";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type {
  AcsInput,
  AcsOutput,
} from "../../../../../application/use-cases/auth/acs.use-case.js";

import { mountAcsHandler } from "../acs.handler.js";

describe("mountAcsHandler", () => {
  it("passes the Bearer token to the use case and returns the session ID", async () => {
    const useCase: UseCase<AcsInput, AcsOutput, BaseError> = vi
      .fn()
      .mockResolvedValue(ok({ sessionId: "one-time-session-id" }));
    const app = Fastify();
    mountAcsHandler(app, useCase);

    const response = await app.inject({
      headers: { authorization: "Bearer assertion-token" },
      method: "GET",
      url: "/api/acs",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ sessionId: "one-time-session-id" });
    expect(useCase).toHaveBeenCalledWith({ token: "assertion-token" });
  });

  it("returns 400 without invoking the use case when the Authorization header is missing", async () => {
    const useCase: UseCase<AcsInput, AcsOutput, BaseError> = vi.fn();
    const app = Fastify();
    mountAcsHandler(app, useCase);

    const response = await app.inject({
      method: "GET",
      url: "/api/acs",
    });

    expect(response.statusCode).toBe(400);
    expect(useCase).not.toHaveBeenCalled();
  });
});
