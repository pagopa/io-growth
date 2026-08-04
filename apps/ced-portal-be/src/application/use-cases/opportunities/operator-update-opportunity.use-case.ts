import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import {
  NotFoundError,
  PreconditionFailedError,
} from "@pagopa/io-core-domain/errors";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import type { OperatorRepository } from "../../../domain/ports/outbound/persistence/operator.repository.js";
import type { OpportunityCategoryRepository } from "../../../domain/ports/outbound/persistence/opportunity-category.repository.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import {
  type BenefitSummary,
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

const OperatorUpdateOpportunityInputSchema = z
  .object({
    // Merge-patch (RFC 7396): omitted = untouched, explicit null = clear.
    beneficiaryBenefit: BenefitInputSchema.optional(),
    caregiverBenefit: BenefitInputSchema.nullable().optional(),
    categoryId: z.ulid().optional(),
    dateFrom: z.iso.date().optional(),
    dateTo: z.iso.date().nullable().optional(),
    // Client-provided value for the optimistic-concurrency CAS.
    expectedUpdatedAt: z.iso.datetime(),
    localizedMetadata: LocalizedMetadataListInputSchema.optional(),
    nationalTerritory: z.boolean().optional(),
    operatorId: z.ulid(),
    opportunityId: z.ulid(),
    placeIds: PlaceIdsInputSchema.optional(),
    url: z.url().max(2048).nullable().optional(),
  })
  .refine(
    (v) =>
      v.beneficiaryBenefit !== undefined ||
      v.caregiverBenefit !== undefined ||
      v.categoryId !== undefined ||
      v.dateFrom !== undefined ||
      v.dateTo !== undefined ||
      v.localizedMetadata !== undefined ||
      v.nationalTerritory !== undefined ||
      v.placeIds !== undefined ||
      v.url !== undefined,
    { message: "At least one editable field must be provided" },
  );

export type OperatorUpdateOpportunityInput = z.input<
  typeof OperatorUpdateOpportunityInputSchema
>;

export type OperatorUpdateOpportunityUseCase = UseCase<
  OperatorUpdateOpportunityInput,
  void,
  BaseError
>;

// States where a benefit change is "binding" (requires re-review). On the free
// states (draft/test_rejected/test_passed) no edit ever changes the state.
const DICHOTOMY_STATUSES = new Set<OpportunityDetail["status"]>([
  OPPORTUNITY_DISPLAY_STATUS.SCHEDULED,
  OPPORTUNITY_STATUS.PUBLISHED,
  OPPORTUNITY_STATUS.SUSPENDED,
]);

const benefitChanged = (
  incoming: BenefitSummary,
  current: BenefitSummary | null,
): boolean =>
  current === null ||
  incoming.type !== current.type ||
  ("value" in incoming ? incoming.value : null) !==
    ("value" in current ? current.value : null) ||
  ("discountType" in incoming ? incoming.discountType : null) !==
    ("discountType" in current ? current.discountType : null) ||
  ("description" in incoming ? incoming.description : null) !==
    ("description" in current ? current.description : null);

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

          if (data.status === OPPORTUNITY_STATUS.TEST_PENDING)
            return errAsync(
              new PreconditionFailedError(
                "Opportunity is under review and cannot be modified",
              ),
            );

          if (data.status === OPPORTUNITY_DISPLAY_STATUS.SCHEDULED_SUSPENSION)
            return errAsync(
              new PreconditionFailedError(
                "A scheduled suspension is pending: cancel it or wait for it to apply before modifying",
              ),
            );

          // Binding = a real benefit change (value diff vs current), but only
          // on the dichotomy states; on free states nothing transitions.
          const benefitIsBinding =
            (v.beneficiaryBenefit !== undefined &&
              benefitChanged(v.beneficiaryBenefit, data.beneficiaryBenefit)) ||
            (v.caregiverBenefit !== undefined &&
              ((v.caregiverBenefit === null) !==
                (data.caregiverBenefit === null) ||
                (v.caregiverBenefit !== null &&
                  benefitChanged(v.caregiverBenefit, data.caregiverBenefit))));

          const transitionToTestPending =
            DICHOTOMY_STATUSES.has(data.status) && benefitIsBinding;

          const wasPublishedLive = data.status === OPPORTUNITY_STATUS.PUBLISHED;

          // validateExistence requires BOTH categoryId and placeIds: fill the
          // one not being edited from the current opportunity. Skip entirely
          // when neither is touched.
          const existence: ResultAsync<void, BaseError> =
            v.categoryId !== undefined || v.placeIds !== undefined
              ? validateExistence({
                  categoryId: v.categoryId ?? data.categoryId,
                  operatorId: v.operatorId,
                  operatorRepository: deps.operatorRepository,
                  opportunityCategoryRepository:
                    deps.opportunityCategoryRepository,
                  placeIds: v.placeIds ?? data.placeIds,
                  placeRepository: deps.placeRepository,
                })
              : okAsync(undefined);

          return existence
            .andThen(
              () =>
                new ResultAsync(
                  deps.opportunityRepository.updateFieldsByIdAndOperatorId({
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
                    transitionToTestPending,
                    url: v.url,
                  }),
                ),
            )
            .andThen(() =>
              // Best-effort (see wasPublishedLive above for the gate). Note:
              // intentionally no refresh on a scheduled->live go-live edit.
              wasPublishedLive
                ? new ResultAsync(
                    deps.materializedViewRepository.refreshAll(),
                  ).orElse(() => okAsync(undefined))
                : okAsync(undefined),
            );
        }),
    );
