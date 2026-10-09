import type { EmailRepository as OneMailEmailClient } from "@pagopa/io-core-adapter-one-mail";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { EmailRepository } from "../../../domain/ports/outbound/email.repository.js";

export interface OneMailEmailRepositoryConfig {
  readonly fromAddress: string;
}

export const createOneMailEmailRepository = (
  emailClient: OneMailEmailClient,
  config: OneMailEmailRepositoryConfig,
): EmailRepository => ({
  sendHtmlEmail: async ({ html, subject, text, to }) => {
    const result = await emailClient.sendHighPriorityEmail({
      emailContent: { html, subject, text },
      from: { email: config.fromAddress },
      to: { email: to },
    });

    if (result.isErr()) {
      return err(new GenericError(result.error.message));
    }
    return ok(undefined);
  },

  sendTemplateEmail: async ({ templateAttributes, templateId, to }) => {
    const result = await emailClient.sendHighPriorityEmail({
      from: { email: config.fromAddress },
      templateContent: { templateAttributes, templateId },
      to: { email: to },
    });

    if (result.isErr()) {
      return err(new GenericError(result.error.message));
    }
    return ok(undefined);
  },
});
