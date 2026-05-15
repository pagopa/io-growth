import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { FimsExchangeAudit, LollipopAudit } from "../../entities.js";

/**
 * Audit logging port for FIMS and lollipop events.
 * The default implementation is a no-op (`createNoopAuditLogger`).
 */
export interface AuditLogger {
  readonly logFimsExchange: (
    data: FimsExchangeAudit,
  ) => Promise<Result<void, BaseError>>;
  readonly logLollipopVerification: (
    data: LollipopAudit,
  ) => Promise<Result<void, BaseError>>;
}
