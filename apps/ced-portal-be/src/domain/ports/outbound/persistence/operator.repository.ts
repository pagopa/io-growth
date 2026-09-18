import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { Operator } from "../../../entities/operator.js";

export interface OperatorRepository {
  readonly create: (input: Operator) => Promise<Result<Operator, BaseError>>;
  readonly getByExternalId: (
    externalId: string,
  ) => Promise<Result<Operator | undefined, BaseError>>;
  readonly getById: (
    id: string,
  ) => Promise<Result<Operator | undefined, BaseError>>;
  /**
   * Revokes the operator and cascades the suspension to all its published
   * opportunities, in a single transaction. Returns how many opportunities
   * were suspended — zero is legitimate.
   *
   * Fails with `NotFoundError` when the operator does not exist, and with
   * `ConflictError` when it has already been revoked: revocation is terminal,
   * so re-applying it would overwrite the original date and reason.
   */
  readonly revokeById: (
    input: RevokeByIdInput,
  ) => Promise<Result<number, BaseError>>;
}

export interface RevokeByIdInput {
  operatorId: string;
  /** Absent when the department gave no reason: the column is set to null. */
  revocationMessage?: string;
  suspensionMessage: string;
}
