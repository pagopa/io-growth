import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { sql } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { IHealthCheckRepository } from "../../../domain/ports/outbound/health-check.repository.js";

export const createDrizzleHealthCheckRepository = <
  TSchema extends Record<string, unknown>,
>(
  db: TypedDbClient<TSchema>,
): IHealthCheckRepository => ({
  checkConnection: async () => {
    try {
      await db.execute(sql`SELECT 1`);
      return ok(true as const);
    } catch {
      return err(new GenericError("Database connection failed"));
    }
  },
});
