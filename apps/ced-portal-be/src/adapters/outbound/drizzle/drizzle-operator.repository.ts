import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { eq } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type {
  CreateOperatorInput,
  Operator,
} from "../../../domain/entities/operator.js";
import type { OperatorRepository } from "../../../domain/ports/outbound/persistence/operator.repository.js";

import { dbClient } from "./client.js";
import { operator } from "./schema/tables.js";

type DbClient = typeof dbClient;

export const createDrizzleOperatorRepository = (
  db: DbClient,
): OperatorRepository => ({
  create: async (
    input: CreateOperatorInput,
  ): Promise<Result<Operator, BaseError>> => {
    try {
      const [created] = await db
        .insert(operator)
        .values({
          externalId: input.externalId,
          name: input.name,
          status: input.status,
        })
        .returning({
          id: operator.id,
          name: operator.name,
        });
      return ok(created);
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
          id: operator.id,
          name: operator.name,
        })
        .from(operator)
        .where(eq(operator.externalId, externalId))
        .limit(1);
      return ok(result[0]);
    } catch (error) {
      return err(
        new GenericError(
          `Failed to get operator by externalId: ${String(error)}`,
        ),
      );
    }
  },
});
