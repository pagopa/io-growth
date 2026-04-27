import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface Session {
  readonly firstName: string;
  readonly lastName: string;
  readonly organizationExternalId: string;
  readonly referentExternalId: string;
  readonly role: string;
}

export interface SessionStore {
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
