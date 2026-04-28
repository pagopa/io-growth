import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { Session } from "../../../entities/session.js";

export interface SessionRepository {
  readonly createOneTimeSessionId: (
    sessionId: string,
    sessionToken: string,
    ttlSeconds: number,
  ) => Promise<Result<void, BaseError>>;
  readonly createSession: (
    sessionToken: string,
    session: Session,
  ) => Promise<Result<void, BaseError>>;
  readonly getSession: (
    sessionToken: string,
  ) => Promise<Result<Session, BaseError>>;
  readonly getSessionTokenByOneTimeId: (
    sessionId: string,
  ) => Promise<Result<string, BaseError>>;
}
