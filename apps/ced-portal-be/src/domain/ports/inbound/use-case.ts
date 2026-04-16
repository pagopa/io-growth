import type { Result } from "neverthrow";

import type { BaseError } from "../../errors/errors.js";

export type UseCase<Input extends object, Output, Error extends BaseError> = (
  input: Input,
) => Promise<Result<Output, Error>>;
