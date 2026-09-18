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
  sendOpportunityApprovedEmail: async ({ opportunityId, to }) => {
    const result = await emailClient.sendHighPriorityEmail({
      emailContent: {
        html: `<p>La tua opportunità (ID: ${opportunityId}) è stata approvata ed è ora pubblicata.</p>`,
        subject: "La tua opportunità è stata approvata",
        text: `La tua opportunità (ID: ${opportunityId}) è stata approvata ed è ora pubblicata.`,
      },
      from: { email: config.fromAddress },
      to: { email: to },
    });

    if (result.isErr()) {
      return err(new GenericError(result.error.message));
    }
    return ok(undefined);
  },
});
