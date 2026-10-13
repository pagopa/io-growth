import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type {
  HtmlMessagePayload,
  TemplateMessagePayload,
} from "../../entities/message-outbox.js";

export interface EmailRepository {
  readonly sendHtmlEmail: (
    input: Omit<HtmlMessagePayload, "type">,
  ) => Promise<Result<void, GenericError>>;
  readonly sendTemplateEmail: (
    input: Omit<TemplateMessagePayload, "type">,
  ) => Promise<Result<void, GenericError>>;
}
