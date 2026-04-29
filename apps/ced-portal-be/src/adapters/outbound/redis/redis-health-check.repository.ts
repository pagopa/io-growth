import type { RedisCommands } from "@pagopa/io-core-adapter-redis";

import { GenericError } from "@pagopa/io-core-domain";
import { err, ok } from "neverthrow";

import type { IHealthCheckRepository } from "../../../domain/ports/outbound/health-check.repository.js";

export const createRedisHealthCheckRepository = (
  client: RedisCommands,
): IHealthCheckRepository => ({
  checkConnection: async () => {
    try {
      await client.ping();
      return ok(true as const);
    } catch {
      return err(new GenericError("Session store connection failed"));
    }
  },
});
