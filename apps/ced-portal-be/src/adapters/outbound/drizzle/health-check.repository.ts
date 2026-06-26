import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { EnvRouter } from "@pagopa/io-core-environment-router";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { sql } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { IHealthCheckRepository } from "../../../domain/ports/outbound/health-check.repository.js";

import * as schema from "./schema/index.js";

export const createDrizzleHealthCheckRepository = (
  dbRouter: EnvRouter<TypedDbClient<typeof schema>>,
): IHealthCheckRepository => {
  const db = dbRouter.getInstance();
  return {
    checkConnection: async () => {
      try {
        await db.execute(sql`SELECT 1`);
        return ok(true as const);
      } catch {
        return err(new GenericError("Database connection failed"));
      }
    },
  };
};
