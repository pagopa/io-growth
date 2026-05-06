import type { BaseError, ValidationError } from "@pagopa/io-core-domain/errors";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Result } from "neverthrow";

import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import { sendErrorResponse } from "./errorMapper.js";
import { validationErrorFromStandardIssues } from "./validator/httpInputStandardSchemaValidator.js";

const SESSION_KEY = Symbol("session");

export type SessionResolver<T> = (
  token: string,
) => Promise<Result<T, BaseError>>;

export const createAuthenticationPreHandler =
  <T>(sessionResolver: SessionResolver<T>) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return sendErrorResponse(
        reply,
        new UnauthorizedError("Missing or invalid Authorization header"),
      );
    }

    const token = authHeader.slice(7);
    const result = await sessionResolver(token);

    if (result.isErr()) {
      return sendErrorResponse(
        reply,
        new UnauthorizedError("Invalid or expired session"),
      );
    }

    (request as unknown as Record<symbol, unknown>)[SESSION_KEY] = result.value;
  };

/**
 * Extracts and validates the session stored on the request by the authentication preHandler.
 *
 * Accepts a StandardSchema to validate the raw session data at runtime,
 * allowing callers to extract different shapes from the same session store.
 *
 * @param request - The Fastify request enriched by `createAuthenticationPreHandler`
 * @param schema  - A StandardSchema (e.g. Zod) describing the expected session shape
 */
export const getSessionFromRequest = async <
  T extends StandardSchemaV1<unknown, unknown>,
>(
  request: FastifyRequest,
  schema: T,
): Promise<Result<StandardSchemaV1.InferOutput<T>, ValidationError>> => {
  const raw = (request as unknown as Record<symbol, unknown>)[SESSION_KEY];

  const result = await schema["~standard"].validate(raw);

  if (result.issues) {
    return err(validationErrorFromStandardIssues(result.issues));
  }

  return ok(result.value);
};
