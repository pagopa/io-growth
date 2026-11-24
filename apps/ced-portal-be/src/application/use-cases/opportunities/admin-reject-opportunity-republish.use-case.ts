import type { UseCase } from "@pagopa/io-core-domain";
import type {
  ConflictError,
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import {
  NotFoundError,
  PreconditionFailedError,
} from "@pagopa/io-core-domain/errors";
import { errAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { EmailLinks } from "../../../domain/entities/message-outbox.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { buildOperatorOpportunityRepublishRejectedMessage } from "../../../domain/entities/message-outbox.js";
import { OPPORTUNITY_STATUS } from "../../../domain/entities/opportunity.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";
import {
  buildOperatorMessages,
  getOpportunityName,
} from "./utils/operator-notification.js";

const AdminRejectOpportunityRepublishInputSchema = z.object({
  opportunityId: z.ulid(),
  republishRejectionMessage: z.string().trim().min(1).max(4096),
});

export type AdminRejectOpportunityRepublishInput = z.infer<
  typeof AdminRejectOpportunityRepublishInputSchema
>;

export type AdminRejectOpportunityRepublishUseCase = UseCase<
  AdminRejectOpportunityRepublishInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeAdminRejectOpportunityRepublishUseCase =
  (
    opportunityRepository: OpportunityRepository,
    profileRepository: ProfileRepository,
    emailLinks: EmailLinks,
  ): AdminRejectOpportunityRepublishUseCase =>
  async (input) =>
    validateUseCaseInput(
      AdminRejectOpportunityRepublishInputSchema,
      input,
    ).andThen((validatedInput) =>
      new ResultAsync(
        opportunityRepository.findById({
          opportunityId: validatedInput.opportunityId,
        }),
      ).andThen((data) => {
        if (!data)
          return errAsync(new NotFoundError("Opportunity", "not found"));

        if (data.status !== OPPORTUNITY_STATUS.SUSPENDED)
          return errAsync(
            new PreconditionFailedError(
              "Opportunity must be suspended to reject its republication",
            ),
          );

        if (!data.republishMessage)
          return errAsync(
            new PreconditionFailedError(
              "No republish request is pending on this opportunity",
            ),
          );

        return buildOperatorMessages(profileRepository, data.operatorId, (to) =>
          buildOperatorOpportunityRepublishRejectedMessage({
            links: emailLinks,
            opportunityName: getOpportunityName(data),
            to,
          }),
        ).andThen(
          (outboxMessages) =>
            new ResultAsync(
              opportunityRepository.rejectRepublishById({
                opportunityId: validatedInput.opportunityId,
                outboxMessages,
                republishRejectionMessage:
                  validatedInput.republishRejectionMessage,
              }),
            ),
        );
      }),
    );
