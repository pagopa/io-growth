import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface IHealthCheckRepository {
  readonly checkConnection: () => Promise<Result<true, GenericError>>;
}
