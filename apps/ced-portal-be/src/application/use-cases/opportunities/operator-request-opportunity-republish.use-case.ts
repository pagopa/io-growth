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

import { buildAdminOpportunityRepublishRequestMessage } from "../../../domain/entities/message-outbox.js";
import {
  ACTOR_TYPE,
  OPPORTUNITY_STATUS,
} from "../../../domain/entities/opportunity.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";
import { buildAdminMessages } from "./utils/admin-notification.js";
import { getOpportunityName } from "./utils/operator-notification.js";

const OperatorRequestOpportunityRepublishInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
  republishMessage: z.string().trim().min(1).max(4096),
});

export type OperatorRequestOpportunityRepublishInput = z.infer<
  typeof OperatorRequestOpportunityRepublishInputSchema
>;

export type OperatorRequestOpportunityRepublishUseCase = UseCase<
  OperatorRequestOpportunityRepublishInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeOperatorRequestOpportunityRepublishUseCase =
  (
    opportunityRepository: OpportunityRepository,
    profileRepository: ProfileRepository,
    mailingConfig: MailingConfig,
  ): OperatorRequestOpportunityRepublishUseCase =>
  async (input) =>
    validateUseCaseInput(
      OperatorRequestOpportunityRepublishInputSchema,
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

        if (data.status !== OPPORTUNITY_STATUS.SUSPENDED)
          return errAsync(
            new PreconditionFailedError(
              "Opportunity must be suspended to request its republication",
            ),
          );

        if (data.suspendedBy !== ACTOR_TYPE.DEPARTMENT)
          return errAsync(
            new PreconditionFailedError(
              "Only a department-suspended opportunity can be requested for republication",
            ),
          );

        if (data.republishMessage)
          return errAsync(
            new PreconditionFailedError(
              "A republish request is already pending on this opportunity",
            ),
          );

        // Notifying the department is best-effort: a failed or missing profile
        // lookup must not fail an otherwise valid republish request.
        return new ResultAsync(
          profileRepository.getByOperatorId(validatedInput.operatorId),
        )
          .orElse(() => okAsync(undefined))
          .andThen(
            (profile) =>
              new ResultAsync(
                opportunityRepository.requestRepublishByIdAndOperatorId({
                  operatorId: validatedInput.operatorId,
                  opportunityId: validatedInput.opportunityId,
                  outboxMessages: profile
                    ? buildAdminMessages(mailingConfig.adminContacts, (to) =>
                        buildAdminOpportunityRepublishRequestMessage({
                          links: mailingConfig.emailLinks,
                          operatorName: profile.displayName,
                          opportunityName: getOpportunityName(data),
                          republishMessage: validatedInput.republishMessage,
                          to,
                        }),
                      )
                    : [],
                  republishMessage: validatedInput.republishMessage,
                }),
              ),
          );
      }),
    );
