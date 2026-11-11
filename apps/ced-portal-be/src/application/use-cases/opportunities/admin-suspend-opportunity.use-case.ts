import type { UseCase } from "@pagopa/io-core-domain";

import {
  ConflictError,
  GenericError,
  NotFoundError,
  PreconditionFailedError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { getApplicationDate } from "@pagopa/io-core-domain/utilities";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { EmailLinks } from "../../../domain/entities/message-outbox.js";
import type { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { buildOperatorOpportunitySuspendedMessage } from "../../../domain/entities/message-outbox.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";
import {
  buildOperatorMessages,
  formatOpportunityDate,
  getOpportunityName,
} from "./utils/operator-notification.js";

const AdminSuspendOpportunityInputSchema = z.object({
  opportunityId: z.ulid(),
  suspendFrom: z.iso.date(),
  suspensionMessage: z.string().trim().min(1).max(4096),
});

export type AdminSuspendOpportunityInput = z.infer<
  typeof AdminSuspendOpportunityInputSchema
>;

export type AdminSuspendOpportunityUseCase = UseCase<
  AdminSuspendOpportunityInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeAdminSuspendOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
    materializedViewRepository: MaterializedViewRepository,
    profileRepository: ProfileRepository,
    emailLinks: EmailLinks,
  ): AdminSuspendOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(AdminSuspendOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findById({
            opportunityId: validatedInput.opportunityId,
          }),
        ).andThen((data) => {
          if (!data)
            return errAsync(new NotFoundError("Opportunity", "not found"));
          if (data.status === "scheduled")
            return errAsync(
              new PreconditionFailedError(
                "Opportunity is not yet live and cannot be suspended",
              ),
            );

          // "scheduled_suspension" (pending schedule) does NOT block the department:
          // the suspension overrides it (immediate absorbs, scheduled overwrites).
          if (
            data.status !== "published" &&
            data.status !== "scheduled_suspension"
          )
            return errAsync(
              new PreconditionFailedError(
                "Opportunity must be in published status to be suspended",
              ),
            );

          const today = getApplicationDate();
          const isScheduled = validatedInput.suspendFrom > today;

          return buildOperatorMessages(
            profileRepository,
            data.operatorId,
            (to) =>
              buildOperatorOpportunitySuspendedMessage({
                links: emailLinks,
                opportunityName: getOpportunityName(data),
                suspensionDate: formatOpportunityDate(
                  isScheduled ? validatedInput.suspendFrom : today,
                ),
                suspensionMessage: validatedInput.suspensionMessage,
                to,
              }),
          )
            .andThen(
              (outboxMessages) =>
                new ResultAsync(
                  opportunityRepository.suspendById({
                    opportunityId: validatedInput.opportunityId,
                    outboxMessages,
                    suspendFrom: isScheduled
                      ? validatedInput.suspendFrom
                      : undefined,
                    suspensionMessage: validatedInput.suspensionMessage,
                  }),
                ),
            )
            .andThen(() =>
              isScheduled
                ? okAsync(undefined)
                : new ResultAsync(
                    materializedViewRepository.refreshAll(),
                  ).orElse(() => okAsync(undefined)),
            );
        }),
    );
