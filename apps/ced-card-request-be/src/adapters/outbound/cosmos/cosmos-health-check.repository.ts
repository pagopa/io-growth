import type { CosmosClient } from "@azure/cosmos";

import { GenericError } from "@pagopa/io-core-domain";
import { err, ok } from "neverthrow";

import type { IHealthCheckRepository } from "../../../domain/ports/outbound/health-check.repository.js";

export const createCosmosHealthCheckRepository = (
  client: CosmosClient,
): IHealthCheckRepository => ({
  checkConnection: async () => {
    try {
      await client.getDatabaseAccount();
      return ok(true as const);
    } catch {
      return err(new GenericError("CosmosDB connection failed"));
    }
  },
});
