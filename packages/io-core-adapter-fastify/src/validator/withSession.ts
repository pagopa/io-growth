import type { InputValidator } from "@pagopa/io-core-domain";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { FastifyRequest } from "fastify";

import { err, ok } from "neverthrow";

import { getSessionFromRequest } from "../authenticationPreHandler.js";

/**
 * Wraps an existing InputValidator adding session extraction and validation.
 *
 * Session enrichment is the only responsibility of this wrapper — all HTTP
 * request validation (body, query, path, headers) is delegated to the
 * inner validator (e.g. one built with `createHttpRequestValidator`).
 *
 * @param sessionSchema  - A StandardSchema (e.g. Zod) to validate the raw session
 * @param innerValidator - The InputValidator that handles HTTP request validation
 * @param buildInput     - Maps the validated session + inner-validated output → use-case input
 */
export const withSession =
  <
    TSessionSchema extends StandardSchemaV1<unknown, unknown>,
    TInnerInput,
    TInput,
  >(
    sessionSchema: TSessionSchema,
    innerValidator: InputValidator<FastifyRequest, TInnerInput>,
    buildInput: (
      session: StandardSchemaV1.InferOutput<TSessionSchema>,
      validatedInput: TInnerInput,
    ) => TInput,
  ): InputValidator<FastifyRequest, TInput> =>
  async (request: FastifyRequest) => {
    const sessionResult = await getSessionFromRequest(request, sessionSchema);

    if (sessionResult.isErr()) {
      return err(sessionResult.error);
    }

    const inputResult = await innerValidator(request);

    if (inputResult.isErr()) {
      return err(inputResult.error);
    }

    return ok(buildInput(sessionResult.value, inputResult.value));
  };
