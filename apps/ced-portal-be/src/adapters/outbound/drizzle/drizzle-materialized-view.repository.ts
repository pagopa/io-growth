import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { EnvRouter } from "@pagopa/io-core-environment-router";

import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";
import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";

import * as schema from "./schema/index.js";
import {
  opportunityMaterializedView,
  placeMaterializedView,
} from "./schema/tables.js";

const VIEW_NAMES = [
  "place_materialized_view",
  "opportunity_materialized_view",
] as const;

export const createDrizzleMaterializedViewRepository = (
  dbRouter: EnvRouter<TypedDbClient<typeof schema>>,
): MaterializedViewRepository => {
  const db = dbRouter.getInstance();
  return {
    refreshAll: async () => {
      const results = await Promise.allSettled([
        db.refreshMaterializedView(placeMaterializedView).concurrently(),
        db.refreshMaterializedView(opportunityMaterializedView).concurrently(),
      ]);

      const failures = results.flatMap((result, i) =>
        result.status === "rejected"
          ? [{ reason: String(result.reason), view: VIEW_NAMES[i] }]
          : [],
      );

      if (failures.length > 0) {
        emitCustomEvent("materialized_view.refresh_failed", {
          caller: "DrizzleMaterializedViewRepository",
          data: { failures },
        })("DrizzleMaterializedViewRepository");

        return err(
          new GenericError(
            `Failed to refresh materialized views: ${failures
              .map((failure) => `${failure.view} (${failure.reason})`)
              .join(", ")}`,
          ),
        );
      }

      return ok(undefined);
    },
  };
};
