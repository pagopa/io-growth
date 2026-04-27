import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface CreateOperatorInput {
  readonly externalId: string;
  readonly name: string;
  readonly status: "active";
}

export interface Operator {
  readonly id: string;
  readonly name: string;
}

export interface OperatorStore {
  readonly create: (
    input: CreateOperatorInput,
  ) => Promise<Result<Operator, BaseError>>;
  readonly getByExternalId: (
    externalId: string,
  ) => Promise<Result<Operator | undefined, BaseError>>;
}
