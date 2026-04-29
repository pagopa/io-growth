import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type {
  CreateOperatorInput,
  Operator,
} from "../../../entities/operator.js";

export interface OperatorRepository {
  readonly create: (
    input: CreateOperatorInput,
  ) => Promise<Result<Operator, BaseError>>;
  readonly getByExternalId: (
    externalId: string,
  ) => Promise<Result<Operator | undefined, BaseError>>;
}
