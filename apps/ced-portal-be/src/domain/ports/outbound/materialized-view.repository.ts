import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface MaterializedViewRepository {
  readonly refreshAll: () => Promise<Result<void, GenericError>>;
}
