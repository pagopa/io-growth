import type { RedisCommands } from "@pagopa/io-core-adapter-redis";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { del, get, setEx } from "@pagopa/io-core-adapter-redis";
import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { Session } from "../../../domain/entities/session.js";
import type { SessionRepository } from "../../../domain/ports/outbound/persistence/session.repository.js";

const SESSION_PREFIX = "session:";
const OTP_PREFIX = "otp:";

export const createRedisSessionRepository = (
  client: RedisCommands,
): SessionRepository => ({
  createOneTimeSessionId: (
    sessionId: string,
    sessionToken: string,
    ttlSeconds: number,
  ): Promise<Result<void, BaseError>> =>
    setEx(client, OTP_PREFIX + sessionId, sessionToken, ttlSeconds),

  createSession: (
    sessionToken: string,
    session: Session,
    ttlSeconds: number,
  ): Promise<Result<void, BaseError>> =>
    setEx(client, SESSION_PREFIX + sessionToken, session, ttlSeconds),

  getSession: async (
    sessionToken: string,
  ): Promise<Result<Session, BaseError>> => {
    const result = await get<Session>(client, SESSION_PREFIX + sessionToken);
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
    const result = await get<string>(client, OTP_PREFIX + sessionId);
    if (result.isErr()) {
      return err(result.error);
    }
    if (result.value === null) {
      return err(new NotFoundError("SessionId", sessionId));
    }
    // One-shot: delete after retrieval
    await del(client, OTP_PREFIX + sessionId);
    return ok(result.value);
  },
});
