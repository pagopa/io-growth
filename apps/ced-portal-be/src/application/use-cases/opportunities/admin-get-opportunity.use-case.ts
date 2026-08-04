import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { OpportunityDetail } from "../../../domain/entities/opportunity.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const AdminGetOpportunityInputSchema = z.object({
  opportunityId: z.ulid(),
});

export type AdminGetOpportunityInput = z.infer<
  typeof AdminGetOpportunityInputSchema
>;

export type AdminGetOpportunityUseCase = UseCase<
  AdminGetOpportunityInput,
  OpportunityDetail,
  GenericError | NotFoundError | ValidationError
>;

export const makeAdminGetOpportunityUseCase =
  (opportunityRepository: OpportunityRepository): AdminGetOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(AdminGetOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findById({
            opportunityId: validatedInput.opportunityId,
          }),
        ).andThen((data) =>
          data ? ok(data) : err(new NotFoundError("Opportunity", "not found")),
        ),
    );
