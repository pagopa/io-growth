import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { RedisCommands } from "./client.js";

export const redisSet = async <T>(
  client: RedisCommands,
  key: string,
  value: T,
): Promise<Result<void, GenericError>> => {
  try {
    await client.set(key, JSON.stringify(value));
    return ok(undefined);
  } catch (error) {
    return err(
      new GenericError(`Redis SET failed for key "${key}": ${String(error)}`),
    );
  }
};

export const redisSetEx = async <T>(
  client: RedisCommands,
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<Result<void, GenericError>> => {
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
    return ok(undefined);
  } catch (error) {
    return err(
      new GenericError(`Redis SETEX failed for key "${key}": ${String(error)}`),
    );
  }
};

export const redisGet = async <T>(
  client: RedisCommands,
  key: string,
): Promise<Result<null | T, GenericError>> => {
  try {
    const raw = await client.get(key);
    if (raw === null) {
      return ok(null);
    }
    return ok(JSON.parse(raw) as T);
  } catch (error) {
    return err(
      new GenericError(`Redis GET failed for key "${key}": ${String(error)}`),
    );
  }
};

export const redisDel = async (
  client: RedisCommands,
  key: string,
): Promise<Result<void, GenericError>> => {
  try {
    await client.del(key);
    return ok(undefined);
  } catch (error) {
    return err(
      new GenericError(`Redis DEL failed for key "${key}": ${String(error)}`),
    );
  }
};
