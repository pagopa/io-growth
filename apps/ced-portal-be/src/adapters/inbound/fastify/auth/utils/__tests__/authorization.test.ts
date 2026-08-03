import type { FastifyReply, FastifyRequest } from "fastify";

import { ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { Session } from "../../../../../../domain/entities/session.js";

import { createSessionContextPreHandler } from "../../../../../../async-local-storage-session-context.js";
import {
  ADMIN_USER_TYPES,
  OPERATOR_USER_TYPES,
} from "../../../../../../domain/entities/user-type.js";
import { withUserTypeAuthorization } from "../authorization.js";

const mockAdminSession: Session = {
  firstName: "Mario",
  lastName: "Rossi",
  operatorExternalId: "",
  operatorName: "",
  referentExternalId: "",
  role: "security",
  userType: "admin",
};

const mockOperatorSession: Session = {
  firstName: "Luca",
  lastName: "Bianchi",
  operatorExternalId: "op-ext-1",
  operatorId: "op-1",
  operatorName: "Ente Demo",
  referentExternalId: "ref-1",
  role: "security",
  userType: "operator",
};

/**
 * Runs `fn` within an ALS context populated with `session`, mirroring the real
 * preHandler wiring in main.ts (authPreHandler -> createSessionContextPreHandler).
 */
const runWithSession = <T>(
  session: Session,
  fn: () => Promise<T>,
): Promise<T> =>
  new Promise((resolve, reject) => {
    const preHandler = createSessionContextPreHandler(() =>
      Promise.resolve(ok(session)),
    );

    preHandler({} as FastifyRequest, {} as FastifyReply, (hookErr) => {
      if (hookErr) {
        reject(hookErr);
        return;
      }
      fn().then(resolve, reject);
    });
  });

describe("withUserTypeAuthorization", () => {
  it("should call the inner validator when the session's userType is allowed", async () => {
    const innerValidator = vi.fn().mockResolvedValue(ok({ foo: "bar" }));
    const validator = withUserTypeAuthorization(
      ADMIN_USER_TYPES,
      innerValidator,
    );

    const request = {} as FastifyRequest;
    const result = await runWithSession(mockAdminSession, () =>
      validator(request),
    );

    expect(result).toEqual(ok({ foo: "bar" }));
    expect(innerValidator).toHaveBeenCalledWith(request);
  });

  it("should reject with ForbiddenError when the session's userType is not in the allow-list", async () => {
    const innerValidator = vi.fn().mockResolvedValue(ok({ foo: "bar" }));
    const validator = withUserTypeAuthorization(
      ADMIN_USER_TYPES,
      innerValidator,
    );

    const result = await runWithSession(mockOperatorSession, () =>
      validator({} as FastifyRequest),
    );

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ForbiddenError" })),
    );
    expect(innerValidator).not.toHaveBeenCalled();
  });

  it("should reject with ForbiddenError when there is no session in ALS", async () => {
    const innerValidator = vi.fn().mockResolvedValue(ok({}));
    const validator = withUserTypeAuthorization(
      OPERATOR_USER_TYPES,
      innerValidator,
    );

    const result = await validator({} as FastifyRequest);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ForbiddenError" })),
    );
    expect(innerValidator).not.toHaveBeenCalled();
  });

  it("should allow operator sessions for OPERATOR_USER_TYPES", async () => {
    const innerValidator = vi.fn().mockResolvedValue(ok({}));
    const validator = withUserTypeAuthorization(
      OPERATOR_USER_TYPES,
      innerValidator,
    );

    const result = await runWithSession(mockOperatorSession, () =>
      validator({} as FastifyRequest),
    );

    expect(result.isOk()).toBe(true);
  });

  it("should propagate the inner validator's error when the userType is allowed", async () => {
    const validationError = new ValidationError("body.name is required");
    const innerValidator = vi.fn().mockResolvedValue(err(validationError));
    const validator = withUserTypeAuthorization(
      OPERATOR_USER_TYPES,
      innerValidator,
    );

    const result = await runWithSession(mockOperatorSession, () =>
      validator({} as FastifyRequest),
    );

    expect(result).toEqual(err(validationError));
  });
});
