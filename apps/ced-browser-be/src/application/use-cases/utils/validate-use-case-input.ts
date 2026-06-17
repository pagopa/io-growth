import type { ZodType } from "zod";

import { ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";

export const validateUseCaseInput = <TOutput>(
  schema: ZodType<TOutput>,
  input: unknown,
): ResultAsync<TOutput, ValidationError> => {
  const parsed = schema.safeParse(input);

  return new ResultAsync(
    Promise.resolve(
      parsed.success
        ? ok(parsed.data)
        : err(new ValidationError(parsed.error.message)),
    ),
  );
};
