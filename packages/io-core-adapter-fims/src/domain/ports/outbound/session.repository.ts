import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { FimsSession } from "../../entities.js";

/**
 * Storage port for FIMS session management.
 *
 * Each app implementation prefixes all keys to avoid collisions in the shared
 * Redis instance (e.g. portal-be uses `session:` / `otp:` unprefixed, so
 * browser-be must use `browser:…` and card-request-be must use `card:…`).
 */
export interface FimsSessionStore {
  /** Delete a temporary key (nonce, OTP, device). */
  readonly deleteTemporary: (key: string) => Promise<Result<void, BaseError>>;
  /** Retrieve a durable session by token. Returns null if not found. */
  readonly getSession: (
    token: string,
  ) => Promise<Result<FimsSession | null, BaseError>>;
  /** Retrieve a temporary value (nonce, OTP, device). Returns null if not found. */
  readonly getTemporary: (
    key: string,
  ) => Promise<Result<null | string, BaseError>>;
  /** Store a durable session keyed by session token. */
  readonly storeSession: (
    token: string,
    session: FimsSession,
    ttlSeconds: number,
  ) => Promise<Result<void, BaseError>>;
  /** Store a temporary value with TTL (nonce, OTP, device). */
  readonly storeTemporary: (
    key: string,
    value: string,
    ttlSeconds: number,
  ) => Promise<Result<void, BaseError>>;
}
