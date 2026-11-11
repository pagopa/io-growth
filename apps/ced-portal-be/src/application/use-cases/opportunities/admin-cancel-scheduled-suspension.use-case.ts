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

import { buildOperatorOpportunitySuspensionCancelledMessage } from "../../../domain/entities/message-outbox.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";
import {
  buildOperatorMessages,
  formatOpportunityDate,
  getOpportunityName,
} from "./utils/operator-notification.js";

const AdminCancelScheduledSuspensionInputSchema = z.object({
  opportunityId: z.ulid(),
});

export type AdminCancelScheduledSuspensionInput = z.infer<
  typeof AdminCancelScheduledSuspensionInputSchema
>;

export type AdminCancelScheduledSuspensionUseCase = UseCase<
  AdminCancelScheduledSuspensionInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeAdminCancelScheduledSuspensionUseCase =
  (
    opportunityRepository: OpportunityRepository,
    profileRepository: ProfileRepository,
    emailLinks: EmailLinks,
  ): AdminCancelScheduledSuspensionUseCase =>
  async (input) =>
    validateUseCaseInput(
      AdminCancelScheduledSuspensionInputSchema,
      input,
    ).andThen((validatedInput) =>
      new ResultAsync(
        opportunityRepository.findById({
          opportunityId: validatedInput.opportunityId,
        }),
      ).andThen((data) => {
        if (!data)
          return errAsync(new NotFoundError("Opportunity", "not found"));

        if (!data.suspendFrom)
          return errAsync(
            new PreconditionFailedError(
              "No scheduled suspension is pending for this opportunity",
            ),
          );

        const scheduledDate = data.suspendFrom;
        return buildOperatorMessages(profileRepository, data.operatorId, (to) =>
          buildOperatorOpportunitySuspensionCancelledMessage({
            links: emailLinks,
            opportunityName: getOpportunityName(data),
            suspensionDate: formatOpportunityDate(scheduledDate),
            to,
          }),
        ).andThen(
          (outboxMessages) =>
            new ResultAsync(
              opportunityRepository.cancelScheduledSuspensionById({
                expectedSuspendFrom: scheduledDate,
                opportunityId: validatedInput.opportunityId,
                outboxMessages,
              }),
            ),
        );
      }),
    );
