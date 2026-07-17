import type { ServiceUnavailableError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { SupportRecord } from "../../../entities/support-record.js";

/**
 * Persistence port for the CosmosDB support record. Deliberately thin: it
 * only knows how to read and persist a record. The idempotency, cascade, and
 * state-transition rules live in the use case, not here.
 */
export interface SupportRecordRepository {
  readonly getByCodiceFiscale: (
    codiceFiscale: string,
  ) => Promise<Result<SupportRecord | undefined, ServiceUnavailableError>>;

  /**
   * Persists the record. When `record._etag` is set, the write is an
   * If-Match replace of the existing document (optimistic concurrency).
   * When absent, the write creates a new document. Returns the persisted
   * record, including its new `_etag`.
   */
  readonly save: (
    record: SupportRecord,
  ) => Promise<Result<SupportRecord, ServiceUnavailableError>>;
}
