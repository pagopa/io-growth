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
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { MailingConfig } from "../../../domain/entities/message-outbox.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { buildAdminOpportunitySuspensionCancelledMessage } from "../../../domain/entities/message-outbox.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";
import { buildAdminMessages } from "./utils/admin-notification.js";
import { getOpportunityName } from "./utils/operator-notification.js";

const OperatorCancelScheduledSuspensionInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
});

export type OperatorCancelScheduledSuspensionInput = z.infer<
  typeof OperatorCancelScheduledSuspensionInputSchema
>;

export type OperatorCancelScheduledSuspensionUseCase = UseCase<
  OperatorCancelScheduledSuspensionInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeOperatorCancelScheduledSuspensionUseCase =
  (
    opportunityRepository: OpportunityRepository,
    profileRepository: ProfileRepository,
    mailingConfig: MailingConfig,
  ): OperatorCancelScheduledSuspensionUseCase =>
  async (input) =>
    validateUseCaseInput(
      OperatorCancelScheduledSuspensionInputSchema,
      input,
    ).andThen((validatedInput) =>
      new ResultAsync(
        opportunityRepository.findByIdAndOperatorId({
          operatorId: validatedInput.operatorId,
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

        if (data.suspendedBy !== "operator")
          return errAsync(
            new PreconditionFailedError(
              "Only the department can cancel a department-scheduled suspension",
            ),
          );

        // Notifying the department is best-effort: a failed or missing profile
        // lookup must not fail an otherwise valid cancellation.
        return new ResultAsync(
          profileRepository.getByOperatorId(validatedInput.operatorId),
        )
          .orElse(() => okAsync(undefined))
          .andThen(
            (profile) =>
              new ResultAsync(
                opportunityRepository.cancelScheduledSuspensionByIdAndOperatorId(
                  {
                    operatorId: validatedInput.operatorId,
                    opportunityId: validatedInput.opportunityId,
                    outboxMessages: profile
                      ? buildAdminMessages(mailingConfig.adminContacts, (to) =>
                          buildAdminOpportunitySuspensionCancelledMessage({
                            links: mailingConfig.emailLinks,
                            operatorName: profile.displayName,
                            opportunityName: getOpportunityName(data),
                            to,
                          }),
                        )
                      : [],
                  },
                ),
              ),
          );
      }),
    );
