import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { eq } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { OpportunityCategory } from "../../../domain/entities/opportunity-category.js";
import type { OpportunityCategoryRepository } from "../../../domain/ports/outbound/persistence/opportunity-category.repository.js";

import { dbClient } from "./client.js";
import { opportunityCategory } from "./schema/tables.js";

type DbClient = typeof dbClient;

export const createDrizzleOpportunityCategoryRepository = (
  db: DbClient,
): OpportunityCategoryRepository => ({
  getById: async (
    id: string,
  ): Promise<Result<OpportunityCategory | undefined, GenericError>> => {
    try {
      const row = await db
        .select()
        .from(opportunityCategory)
        .where(eq(opportunityCategory.id, id))
        .limit(1);

      return ok(
        row[0]
          ? {
              description: row[0].description,
              id: row[0].id,
              title: row[0].title,
            }
          : undefined,
      );
    } catch (error) {
      return err(
        new GenericError(
          `Failed to get opportunity category by id: ${String(error)}`,
        ),
      );
    }
  },
  list: async (): Promise<Result<OpportunityCategory[], GenericError>> => {
    try {
      const rows = await db.select().from(opportunityCategory);

      return ok(
        rows.map((row) => ({
          description: row.description,
          id: row.id,
          title: row.title,
        })),
      );
    } catch (error) {
      return err(
        new GenericError(
          `Failed to list opportunity categories: ${String(error)}`,
        ),
      );
    }
  },
});
