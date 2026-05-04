import type { InputValidator } from "@pagopa/io-core-domain";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { FastifyRequest } from "fastify";

import { err, ok } from "neverthrow";

import { getSessionFromRequest } from "../authenticationPreHandler.js";
import { validationErrorFromStandardIssues } from "./httpInputStandardSchemaValidator.js";

/**
 * Creates an InputValidator for authenticated routes that need body validation.
 * Combines StandardSchema session extraction with StandardSchema body validation.
 *
 * @param sessionSchema - A StandardSchema (e.g. Zod) to validate the raw session
 * @param bodySchema    - A StandardSchema (e.g. Zod) to validate `request.body`
 * @param buildInput    - Maps the validated session + validated body → use-case input
 */
export const createAuthenticatedInputValidator =
  <
    TSessionSchema extends StandardSchemaV1<unknown, unknown>,
    TBodySchema extends StandardSchemaV1<unknown, unknown>,
    TInput,
  >(
    sessionSchema: TSessionSchema,
    bodySchema: TBodySchema,
    buildInput: (
      session: StandardSchemaV1.InferOutput<TSessionSchema>,
      validatedBody: StandardSchemaV1.InferOutput<TBodySchema>,
    ) => TInput,
  ): InputValidator<FastifyRequest, TInput> =>
  async (request: FastifyRequest) => {
    const sessionResult = await getSessionFromRequest(request, sessionSchema);

    if (sessionResult.isErr()) {
      return err(sessionResult.error);
    }

    const bodyResult = await bodySchema["~standard"].validate(request.body);

    if (bodyResult.issues) {
      return err(validationErrorFromStandardIssues(bodyResult.issues));
    }

    return ok(buildInput(sessionResult.value, bodyResult.value));
  };

/**
 * Creates an InputValidator for authenticated routes that only need session data.
 * No body/query validation — useful for GET/DELETE endpoints where identity is the input.
 *
 * @param sessionSchema - A StandardSchema (e.g. Zod) to validate the raw session
 * @param buildInput    - Maps the validated session → use-case input
 */
export const createSessionInputValidator =
  <TSessionSchema extends StandardSchemaV1<unknown, unknown>, TInput>(
    sessionSchema: TSessionSchema,
    buildInput: (
      session: StandardSchemaV1.InferOutput<TSessionSchema>,
    ) => TInput,
  ): InputValidator<FastifyRequest, TInput> =>
  async (request: FastifyRequest) => {
    const sessionResult = await getSessionFromRequest(request, sessionSchema);

    if (sessionResult.isErr()) {
      return err(sessionResult.error);
    }

    return ok(buildInput(sessionResult.value));
  };
