import type { InputValidator } from "@pagopa/io-core-domain";
import type { ValidationError } from "@pagopa/io-core-domain/errors";
import type { FastifyRequest } from "fastify";

import { ForbiddenError } from "@pagopa/io-core-domain/errors";
import { err } from "neverthrow";

const ALLOWED_USER_TYPES: readonly ("admin" | "operator" | "test_user")[] = [
  "admin",
  "test_user",
];

// InputValidator fixes the error type to ValidationError, but we need to return a ForbiddenError (403)
// here. The cast is safe at runtime because the error handler dispatches on the error's status code,
// not on the TypeScript type. A cleaner solution would require changing the InputValidator signature.
export const withUserTypeAuthorization =
  <T extends { userType: "admin" | "operator" | "test_user" }>(
    innerValidator: InputValidator<FastifyRequest, T>,
  ): InputValidator<FastifyRequest, T> =>
  async (request) => {
    const result = await innerValidator(request);
    if (result.isErr()) return result;
    if (!ALLOWED_USER_TYPES.includes(result.value.userType)) {
      return err(new ForbiddenError() as unknown as ValidationError);
    }
    return result;
  };
