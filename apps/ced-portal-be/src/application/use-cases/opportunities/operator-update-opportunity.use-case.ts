import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { NotFoundError, ValidationError } from "@pagopa/io-core-domain/errors";
import { err, errAsync, ok, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import type { OperatorRepository } from "../../../domain/ports/outbound/persistence/operator.repository.js";
import type { OpportunityCategoryRepository } from "../../../domain/ports/outbound/persistence/opportunity-category.repository.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import {
  OPPORTUNITY_DISPLAY_STATUS,
  OPPORTUNITY_STATUS,
  type OpportunityDetail,
} from "../../../domain/entities/opportunity.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";
import {
  BenefitInputSchema,
  LocalizedMetadataListInputSchema,
  PlaceIdsInputSchema,
  validateExistence,
} from "./utils/opportunity-input.js";
import {
  OPPORTUNITY_TRANSITION,
  resolveOpportunityStatus,
} from "./utils/opportunity.status-resolver.js";

const OperatorUpdateOpportunityInputSchema = z.object({
  beneficiaryBenefit: BenefitInputSchema,
  caregiverBenefit: BenefitInputSchema.optional(),
  categoryId: z.ulid(),
  dateFrom: z.iso.date(),
  dateTo: z.iso.date().optional(),
  // Client-provided value for the optimistic-concurrency CAS.
  expectedUpdatedAt: z.iso.datetime(),
  localizedMetadata: LocalizedMetadataListInputSchema,
  nationalTerritory: z.boolean(),
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
  placeIds: PlaceIdsInputSchema,
  url: z.url().max(2048).optional(),
});

export type OperatorUpdateOpportunityInput = z.input<
  typeof OperatorUpdateOpportunityInputSchema
>;

export type OperatorUpdateOpportunityUseCase = UseCase<
  OperatorUpdateOpportunityInput,
  void,
  BaseError
>;

interface ValidatePublishedOpportunityDatesParams {
  readonly currentDateFrom: string;
  readonly dateFrom: string;
  readonly dateTo?: string;
  readonly status: OpportunityDetail["status"];
  readonly today: string;
}

const validatePublishedOpportunityDates = ({
  currentDateFrom,
  dateFrom,
  dateTo,
  status,
  today,
}: ValidatePublishedOpportunityDatesParams): Result<void, ValidationError> => {
  if (status !== OPPORTUNITY_STATUS.PUBLISHED) {
    return ok(undefined);
  }

  // A live published opportunity cannot expire today or in the past. Omitting
  // dateTo clears the expiry and is allowed.
  if (dateTo !== undefined && dateTo <= today) {
    return err(new ValidationError("dateTo must be at least tomorrow"));
  }

  // The dateFrom field cannot be modified for a live published opportunity.
  if (dateFrom !== currentDateFrom) {
    return err(
      new ValidationError(
        "dateFrom cannot be modified for a published opportunity",
      ),
    );
  }

  return ok(undefined);
};

export const makeOperatorUpdateOpportunityUseCase =
  (deps: {
    materializedViewRepository: MaterializedViewRepository;
    operatorRepository: OperatorRepository;
    opportunityCategoryRepository: OpportunityCategoryRepository;
    opportunityRepository: OpportunityRepository;
    placeRepository: PlaceRepository;
  }): OperatorUpdateOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorUpdateOpportunityInputSchema, input).andThen(
      (v) =>
        new ResultAsync(
          deps.opportunityRepository.findByIdAndOperatorId({
            operatorId: v.operatorId,
            opportunityId: v.opportunityId,
          }),
        ).andThen((data) => {
          if (!data)
            return errAsync(new NotFoundError("Opportunity", "not found"));

          const statusResult = resolveOpportunityStatus(data, {
            next: {
              beneficiaryBenefit: v.beneficiaryBenefit,
              caregiverBenefit: v.caregiverBenefit,
            },
            type: OPPORTUNITY_TRANSITION.REPLACE,
          });
          if (statusResult.isErr()) return errAsync(statusResult.error);

          const today = new Date().toISOString().slice(0, 10);

          const publishedDatesResult = validatePublishedOpportunityDates({
            currentDateFrom: data.dateFrom,
            dateFrom: v.dateFrom,
            dateTo: v.dateTo,
            status: data.status,
            today,
          });
          if (publishedDatesResult.isErr())
            return errAsync(publishedDatesResult.error);

          // Live published rows are already in the search MV, so any edit must
          // refresh. Scheduled is stored as published with a future dateFrom
          // and is absent from the MV; if this replacement moves dateFrom to
          // today or earlier the opportunity becomes live and must refresh now
          // rather than waiting for the 15-minute cron.
          const wasPublishedLive = data.status === OPPORTUNITY_STATUS.PUBLISHED;
          const becomesPublishedLive =
            data.status === OPPORTUNITY_DISPLAY_STATUS.SCHEDULED &&
            v.dateFrom <= today;

          const existence: ResultAsync<void, BaseError> = validateExistence({
            categoryId: v.categoryId,
            operatorId: v.operatorId,
            operatorRepository: deps.operatorRepository,
            opportunityCategoryRepository: deps.opportunityCategoryRepository,
            placeIds: v.placeIds,
            placeRepository: deps.placeRepository,
          });

          return existence
            .andThen(
              () =>
                new ResultAsync(
                  deps.opportunityRepository.updateByIdAndOperatorId({
                    beneficiaryBenefit: v.beneficiaryBenefit,
                    caregiverBenefit: v.caregiverBenefit,
                    categoryId: v.categoryId,
                    dateFrom: v.dateFrom,
                    dateTo: v.dateTo,
                    expectedUpdatedAt: v.expectedUpdatedAt,
                    localizedMetadata: v.localizedMetadata,
                    nationalTerritory: v.nationalTerritory,
                    operatorId: v.operatorId,
                    opportunityId: v.opportunityId,
                    placeIds: v.placeIds,
                    status: statusResult.value.to,
                    url: v.url,
                  }),
                ),
            )
            .andThen(() =>
              // Best-effort (see wasPublishedLive / becomesPublishedLive).
              wasPublishedLive || becomesPublishedLive
                ? new ResultAsync(
                    deps.materializedViewRepository.refreshAll(),
                  ).orElse(() => okAsync(undefined))
                : okAsync(undefined),
            );
        }),
    );
