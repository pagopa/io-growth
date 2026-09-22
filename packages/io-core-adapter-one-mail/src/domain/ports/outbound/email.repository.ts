import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type {
  EmailHighPriorityBodyDTO,
  EmailLowPriorityBodyDTO,
  EmailStatusItemResponseDTO,
  EmailSuccessResponseDTO,
  SanitizeHtmlBodyDTO,
  SanitizeHtmlResponseDTO,
} from "../../../generated/model/index.js";

export interface EmailRepository {
  readonly getEmailStatuses: (
    requestId: string,
  ) => Promise<Result<EmailStatusItemResponseDTO[], BaseError>>;

  readonly sanitizeHtml: (
    body: SanitizeHtmlBodyDTO,
  ) => Promise<Result<SanitizeHtmlResponseDTO, BaseError>>;

  readonly sendHighPriorityEmail: (
    body: EmailHighPriorityBodyDTO,
    opts?: SendEmailOptions,
  ) => Promise<Result<EmailSuccessResponseDTO, BaseError>>;

  readonly sendLowPriorityEmail: (
    body: EmailLowPriorityBodyDTO,
    opts?: SendEmailOptions,
  ) => Promise<Result<EmailSuccessResponseDTO, BaseError>>;
}

export interface SendEmailOptions {
  /** Ignored in production; propagated to OneMail as the `dryRun` query param. */
  readonly dryRun?: boolean;
}
