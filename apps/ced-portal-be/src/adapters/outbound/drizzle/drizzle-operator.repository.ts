import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import {
  ConflictError,
  GenericError,
  NotFoundError,
} from "@pagopa/io-core-domain/errors";
import { and, eq, ne } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type {
  OperatorRepository,
  RevokeByIdInput,
} from "../../../domain/ports/outbound/persistence/operator.repository.js";

import {
  type Operator,
  OPERATOR_STATUS,
} from "../../../domain/entities/operator.js";
import { suspendAllOpportunitiesByOperatorIdInTransaction } from "./opportunity.transaction.js";
import * as schema from "./schema/index.js";
import { operator } from "./schema/tables.js";

export const createDrizzleOperatorRepository = (
  db: TypedDbClient<typeof schema>,
): OperatorRepository => ({
  create: async (input: Operator): Promise<Result<Operator, BaseError>> => {
    try {
      await db.transaction(async (tx) => {
        await tx.insert(operator).values({
          externalId: input.externalId,
          id: input.id,
          name: input.name,
          status: input.status,
        });
      });
      return ok(input);
    } catch (error) {
      return err(
        new GenericError(`Failed to create operator: ${String(error)}`),
      );
    }
  },
  getByExternalId: async (
    externalId: string,
  ): Promise<Result<Operator | undefined, BaseError>> => {
    try {
      const result = await db
        .select({
          externalId: operator.externalId,
          id: operator.id,
          name: operator.name,
          status: operator.status,
        })
        .from(operator)
        .where(eq(operator.externalId, externalId))
        .limit(1);
      return ok(
        result[0]
          ? {
              externalId: result[0].externalId,
              id: result[0].id,
              name: result[0].name,
              status: result[0].status,
            }
          : undefined,
      );
    } catch (error) {
      return err(
        new GenericError(
          `Failed to get operator by externalId: ${String(error)}`,
        ),
      );
    }
  },
  getById: async (
    id: string,
  ): Promise<Result<Operator | undefined, BaseError>> => {
    try {
      const result = await db
        .select({
          externalId: operator.externalId,
          id: operator.id,
          name: operator.name,
          status: operator.status,
        })
        .from(operator)
        .where(eq(operator.id, id))
        .limit(1);
      return ok(
        result[0]
          ? {
              externalId: result[0].externalId,
              id: result[0].id,
              name: result[0].name,
              status: result[0].status,
            }
          : undefined,
      );
    } catch (error) {
      return err(
        new GenericError(`Failed to get operator by id: ${String(error)}`),
      );
    }
  },
  /**
   * Revokes the operator and cascades the suspension to its published
   * opportunities in a single transaction
   */
  revokeById: async (
    input: RevokeByIdInput,
  ): Promise<Result<number, BaseError>> => {
    try {
      let suspendedCount = 0;

      await db.transaction(async (tx) => {
        const now = new Date();
        const result = await tx
          .update(operator)
          .set({
            revocationMessage: input.revocationMessage ?? null,
            revokedAt: now,
            status: OPERATOR_STATUS.REVOKED,
            updatedAt: now,
          })
          .where(
            and(
              eq(operator.id, input.operatorId),
              ne(operator.status, OPERATOR_STATUS.REVOKED),
            ),
          );

        if (result.count === 0) {
          // The CAS cannot tell "no such operator" from "already revoked":
          // read the row back to pick the right error, 404 vs 409.
          const existing = await tx
            .select({ status: operator.status })
            .from(operator)
            .where(eq(operator.id, input.operatorId))
            .limit(1);

          throw existing[0]
            ? new ConflictError(
                `Operator ${input.operatorId} has already been revoked`,
              )
            : new NotFoundError("Operator", input.operatorId);
        }

        suspendedCount = await suspendAllOpportunitiesByOperatorIdInTransaction(
          tx,
          input.operatorId,
          input.suspensionMessage,
        );
      });

      return ok(suspendedCount);
    } catch (error) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        return err(error);
      }
      return err(
        new GenericError(`Failed to revoke operator: ${String(error)}`),
      );
    }
  },
});
