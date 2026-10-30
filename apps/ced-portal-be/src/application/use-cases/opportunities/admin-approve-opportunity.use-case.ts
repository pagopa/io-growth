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

import type { EmailLinks } from "../../../domain/entities/message-outbox.js";
import type { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { buildOperatorOpportunityApprovedMessage } from "../../../domain/entities/message-outbox.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";
import {
  buildOperatorMessages,
  getOpportunityName,
} from "./utils/operator-notification.js";

const AdminApproveOpportunityInputSchema = z.object({
  dateFrom: z.iso.date().optional(),
  opportunityId: z.ulid(),
});

export type AdminApproveOpportunityInput = z.infer<
  typeof AdminApproveOpportunityInputSchema
>;

export type AdminApproveOpportunityUseCase = UseCase<
  AdminApproveOpportunityInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeAdminApproveOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
    materializedViewRepository: MaterializedViewRepository,
    profileRepository: ProfileRepository,
    emailLinks: EmailLinks,
  ): AdminApproveOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(AdminApproveOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findById({
            opportunityId: validatedInput.opportunityId,
          }),
        ).andThen((data) => {
          if (!data)
            return errAsync(new NotFoundError("Opportunity", "not found"));
          if (data.status !== "test_pending" && data.status !== "test_rejected")
            return errAsync(
              new PreconditionFailedError(
                "Opportunity must be in test_pending or test_rejected status to be approved",
              ),
            );
          const today = getApplicationDate();

          const opportunityName = getOpportunityName(data);
          const availabilityDate = new Date(
            validatedInput.dateFrom ?? data.dateFrom,
          ).toLocaleDateString("it-IT");

          return buildOperatorMessages(
            profileRepository,
            data.operatorId,
            (to) =>
              buildOperatorOpportunityApprovedMessage({
                availabilityDate,
                links: emailLinks,
                opportunityName,
                to,
              }),
          )
            .andThen(
              (outboxMessages) =>
                new ResultAsync(
                  opportunityRepository.updateStatusById({
                    changeRequestMessage: null,
                    dateFrom: validatedInput.dateFrom,
                    expectedStatuses: ["test_pending", "test_rejected"],
                    opportunityId: validatedInput.opportunityId,
                    outboxMessages,
                    status: "published",
                  }),
                ),
            )
            .andThen(() =>
              data.dateFrom <= today
                ? new ResultAsync(
                    materializedViewRepository.refreshAll(),
                  ).orElse(() => okAsync(undefined))
                : okAsync(undefined),
            );
        }),
    );
