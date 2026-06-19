import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";

import * as schema from "./schema/index.js";
import {
  opportunityMaterializedView,
  placeMaterializedView,
} from "./schema/tables.js";

export const createDrizzleMaterializedViewRepository = (
  db: TypedDbClient<typeof schema>,
): MaterializedViewRepository => ({
  refreshAll: async () => {
    try {
      await db.refreshMaterializedView(placeMaterializedView);
      await db.refreshMaterializedView(opportunityMaterializedView);
      return ok(undefined);
    } catch {
      return err(new GenericError("Failed to refresh materialized views"));
    }
  },
});
