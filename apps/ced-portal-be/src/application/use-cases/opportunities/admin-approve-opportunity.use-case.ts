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

import type { OpportunityDetail } from "../../../domain/entities/opportunity.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { EmailRepository } from "../../../domain/ports/outbound/email.repository.js";
import { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

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

// Falls back to the opportunity id when no Italian display name is set.
const getOpportunityName = (data: OpportunityDetail): string =>
  data.localizedMetadata.find(
    (metadata) => metadata.key === "name" && metadata.language === "it",
  )?.value ?? data.id;

// Notifying the operator is best-effort: a failed lookup or send must not
// fail an otherwise successful approval.
const notifyOperatorOfApproval = (
  profileRepository: ProfileRepository,
  emailRepository: EmailRepository,
  operatorId: string | undefined,
  opportunityName: string,
) =>
  (operatorId
    ? new ResultAsync(profileRepository.getByOperatorId(operatorId))
    : okAsync(undefined)
  )
    .andThen((profile) =>
      profile
        ? new ResultAsync(
            emailRepository.sendOpportunityApprovedEmail({
              opportunityName,
              to: profile.contactEmail,
            }),
          )
        : okAsync(undefined),
    )
    .orElse(() => okAsync(undefined));

export const makeAdminApproveOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
    materializedViewRepository: MaterializedViewRepository,
    profileRepository: ProfileRepository,
    emailRepository: EmailRepository,
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
          const today = new Date().toISOString().slice(0, 10);

          return new ResultAsync(
            opportunityRepository.updateStatusById({
              dateFrom: validatedInput.dateFrom,
              expectedStatuses: ["test_pending", "test_rejected"],
              opportunityId: validatedInput.opportunityId,
              status: "published",
            }),
          )
            .andThen(() =>
              data.dateFrom <= today
                ? new ResultAsync(
                    materializedViewRepository.refreshAll(),
                  ).orElse(() => okAsync(undefined))
                : okAsync(undefined),
            )
            .andThen(() =>
              notifyOperatorOfApproval(
                profileRepository,
                emailRepository,
                data.operatorId,
                getOpportunityName(data),
              ),
            );
        }),
    );
