import type { RedisCommands } from "@pagopa/io-core-adapter-redis";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import {
  redisDel,
  redisGet,
  redisSet,
  redisSetEx,
} from "@pagopa/io-core-adapter-redis";
import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type {
  Session,
  SessionStore,
} from "../../../application/ports/session-store.port.js";

const SESSION_PREFIX = "session:";
const OTP_PREFIX = "otp:";

export const createRedisSessionStore = (
  client: RedisCommands,
): SessionStore => ({
  createOneTimeSessionId: (
    sessionId: string,
    sessionToken: string,
    ttlSeconds: number,
  ): Promise<Result<void, BaseError>> =>
    redisSetEx(client, OTP_PREFIX + sessionId, sessionToken, ttlSeconds),

  createSession: (
    sessionToken: string,
    session: Session,
  ): Promise<Result<void, BaseError>> =>
    redisSet(client, SESSION_PREFIX + sessionToken, session),

  getSession: async (
    sessionToken: string,
  ): Promise<Result<Session, BaseError>> => {
    const result = await redisGet<Session>(
      client,
      SESSION_PREFIX + sessionToken,
    );
    if (result.isErr()) {
      return err(result.error);
    }
    if (result.value === null) {
      return err(new NotFoundError("Session", sessionToken));
    }
    return ok(result.value);
  },

  getSessionTokenByOneTimeId: async (
    sessionId: string,
  ): Promise<Result<string, BaseError>> => {
    const result = await redisGet<string>(client, OTP_PREFIX + sessionId);
    if (result.isErr()) {
      return err(result.error);
    }
    if (result.value === null) {
      return err(new NotFoundError("SessionId", sessionId));
    }
    // One-shot: delete after retrieval
    await redisDel(client, OTP_PREFIX + sessionId);
    return ok(result.value);
  },
});
