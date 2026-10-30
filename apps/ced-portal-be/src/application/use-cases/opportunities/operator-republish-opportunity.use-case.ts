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
import { getApplicationDate } from "@pagopa/io-core-domain/utilities";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { MailingConfig } from "../../../domain/entities/message-outbox.js";
import type { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { buildAdminOpportunityRepublishedMessage } from "../../../domain/entities/message-outbox.js";
import {
  ACTOR_TYPE,
  OPPORTUNITY_STATUS,
} from "../../../domain/entities/opportunity.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";
import { buildAdminMessages } from "./utils/admin-notification.js";
import { getOpportunityName } from "./utils/operator-notification.js";

const OperatorRepublishOpportunityInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
});

export type OperatorRepublishOpportunityInput = z.infer<
  typeof OperatorRepublishOpportunityInputSchema
>;

export type OperatorRepublishOpportunityUseCase = UseCase<
  OperatorRepublishOpportunityInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeOperatorRepublishOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
    materializedViewRepository: MaterializedViewRepository,
    profileRepository: ProfileRepository,
    mailingConfig: MailingConfig,
  ): OperatorRepublishOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(
      OperatorRepublishOpportunityInputSchema,
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
              "Opportunity must be suspended to be republished",
            ),
          );

        if (data.suspendedBy !== ACTOR_TYPE.OPERATOR)
          return errAsync(
            new PreconditionFailedError(
              "Only the department can republish a department-suspended opportunity",
            ),
          );

        const today = getApplicationDate();
        if (data.dateTo && data.dateTo <= today)
          return errAsync(
            new PreconditionFailedError(
              "Opportunity end date must be in the future to republish",
            ),
          );

        // Notifying the department is best-effort: a failed or missing profile
        // lookup must not fail an otherwise valid republish.
        return new ResultAsync(
          profileRepository.getByOperatorId(validatedInput.operatorId),
        )
          .orElse(() => okAsync(undefined))
          .andThen(
            (profile) =>
              new ResultAsync(
                opportunityRepository.republishByIdAndOperatorId({
                  operatorId: validatedInput.operatorId,
                  opportunityId: validatedInput.opportunityId,
                  outboxMessages: profile
                    ? buildAdminMessages(mailingConfig.adminContacts, (to) =>
                        buildAdminOpportunityRepublishedMessage({
                          links: mailingConfig.emailLinks,
                          operatorName: profile.displayName,
                          opportunityName: getOpportunityName(data),
                          to,
                        }),
                      )
                    : [],
                }),
              ),
          )
          .andThen(() =>
            new ResultAsync(materializedViewRepository.refreshAll()).orElse(
              () => okAsync(undefined),
            ),
          );
      }),
    );
