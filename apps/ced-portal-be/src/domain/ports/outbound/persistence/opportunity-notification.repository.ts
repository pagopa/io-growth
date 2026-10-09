import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface OpportunityNotificationRepository {
  /**
   * In one transaction, enqueues the "published" message for up to `limit`
   * opportunities that are visible and not yet notified, and marks them as
   * notified. Rows locked by a concurrent run are skipped.
   * Returns how many opportunities were notified.
   */
  readonly enqueuePublishedMessages: (
    limit: number,
  ) => Promise<Result<number, GenericError>>;
}
