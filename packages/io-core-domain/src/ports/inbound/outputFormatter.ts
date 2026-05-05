import type { Result } from "neverthrow";

import type { GenericError } from "../../errors/index.js";

/**
 * An OutputFormatter takes a use-case output of type O and returns a Result
 * containing either a formatted output of type R or a GenericError.
 */
export type OutputFormatter<O, R> = (
  output: O,
) => Promise<Result<R, GenericError>>;
