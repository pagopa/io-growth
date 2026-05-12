import type {
  FimsSession,
  FimsSessionStore,
} from "@pagopa/io-core-adapter-fims";
import type { RedisCommands } from "@pagopa/io-core-adapter-redis";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { del, get, setEx } from "@pagopa/io-core-adapter-redis";
import { err, ok } from "neverthrow";

const KEY_PREFIX = "browser:";

/**
 * Redis-backed FimsSessionStore for ced-browser-be.
 *
 * All keys are namespaced with "browser:" to avoid collisions with
 * ced-portal-be and ced-card-request-be that share the same Redis instance.
 */
export const createRedisSessionStore = (
  client: RedisCommands,
): FimsSessionStore => ({
  deleteTemporary: (key) => del(client, `${KEY_PREFIX}${key}`),

  getSession: async (token): Promise<Result<FimsSession | null, BaseError>> => {
    const result = await get<FimsSession>(
      client,
      `${KEY_PREFIX}session:${token}`,
    );
    if (result.isErr()) return err(result.error);
    return ok(result.value);
  },

  getTemporary: async (key): Promise<Result<null | string, BaseError>> => {
    const result = await get<string>(client, `${KEY_PREFIX}${key}`);
    if (result.isErr()) return err(result.error);
    return ok(result.value);
  },

  storeSession: (token, session, ttlSeconds) =>
    setEx(client, `${KEY_PREFIX}session:${token}`, session, ttlSeconds),

  storeTemporary: (key, value, ttlSeconds) =>
    setEx(client, `${KEY_PREFIX}${key}`, value, ttlSeconds),
});
