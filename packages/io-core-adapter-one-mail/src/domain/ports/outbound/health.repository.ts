import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type {
  HealthResponseDTO,
  SimpleHealthResponseDTO,
} from "../../../generated/model/index.js";

export interface HealthRepository {
  readonly checkLiveness: () => Promise<
    Result<SimpleHealthResponseDTO, BaseError>
  >;
  readonly checkReadiness: () => Promise<Result<HealthResponseDTO, BaseError>>;
}
