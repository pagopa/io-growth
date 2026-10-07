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
  sendOpportunityApprovedEmail: async ({
    availabilityDate,
    opportunityName,
    to,
  }) => {
    const result = await emailClient.sendHighPriorityEmail({
      from: { email: config.fromAddress },
      templateContent: {
        templateAttributes: {
          availabilityDate,
          opportunityName,
        },
        templateId: "ced_opportunity-approved",
      },
      to: { email: to },
    });

    if (result.isErr()) {
      return err(new GenericError(result.error.message));
    }
    return ok(undefined);
  },

  sendOpportunityPublishedEmail: async ({ opportunityName, to }) => {
    const result = await emailClient.sendHighPriorityEmail({
      from: { email: config.fromAddress },
      templateContent: {
        templateAttributes: {
          opportunityName,
        },
        templateId: "ced_opportunity-published",
      },
      to: { email: to },
    });

    if (result.isErr()) {
      return err(new GenericError(result.error.message));
    }
    return ok(undefined);
  },
});
