import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { OutboxMessage } from "../../../entities/message-outbox.js";

export interface MarkMessageFailedInput {
  readonly error: string;
  readonly id: string;
}

export interface MessageOutboxRepository {
  /**
   * Atomically locks the oldest pending message (skipping rows locked by a
   * concurrent run), marks it as sending, consumes one attempt and commits
   * before returning, so the claim is durable before the send happens.
   * Messages claimed at or after `claimedBefore` are skipped, so a retry
   * waits for the next run.
   */
  readonly claimNext: (
    claimedBefore: Date,
  ) => Promise<Result<OutboxMessage | undefined, GenericError>>;
  /** Marks messages stuck in sending since before `olderThan` as failed. */
  readonly failStaleSending: (
    olderThan: Date,
  ) => Promise<Result<number, GenericError>>;
  /** Re-queues the message while attempts remain, otherwise marks it failed. */
  readonly markFailed: (
    input: MarkMessageFailedInput,
  ) => Promise<Result<void, GenericError>>;
  /** Marks the message as successfully sent. */
  readonly markSent: (id: string) => Promise<Result<void, GenericError>>;
}
