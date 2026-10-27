import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { eq } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { OpportunityCategory } from "../../../domain/entities/opportunity-category.js";
import type { OpportunityCategoryRepository } from "../../../domain/ports/outbound/persistence/opportunity-category.repository.js";

import { OpportunityCategorySchema } from "../../../domain/entities/opportunity-category.js";
import * as schema from "./schema/index.js";
import { opportunityCategory } from "./schema/tables.js";

export const createDrizzleOpportunityCategoryRepository = (
  db: TypedDbClient<typeof schema>,
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

      return ok(row[0] ? OpportunityCategorySchema.parse(row[0]) : undefined);
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

      return ok(rows.map((row) => OpportunityCategorySchema.parse(row)));
    } catch (error) {
      return err(
        new GenericError(
          `Failed to list opportunity categories: ${String(error)}`,
        ),
      );
    }
  },
});
