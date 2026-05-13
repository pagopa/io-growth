import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { eq } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { Operator } from "../../../domain/entities/operator.js";
import type { OperatorRepository } from "../../../domain/ports/outbound/persistence/operator.repository.js";

import { dbClient } from "./client.js";
import { operator } from "./schema/tables.js";

type DbClient = typeof dbClient;

export const createDrizzleOperatorRepository = (
  db: DbClient,
): OperatorRepository => ({
  create: async (input: Operator): Promise<Result<Operator, BaseError>> => {
    try {
      await db.insert(operator).values({
        externalId: input.externalId,
        id: input.id,
        name: input.name,
        status: input.status,
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
});
