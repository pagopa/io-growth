import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { ulid } from "ulid";
import { z } from "zod";

import type {
  Benefit,
  OpportunityDetail,
} from "../../../domain/entities/opportunity.js";
import type { OperatorRepository } from "../../../domain/ports/outbound/persistence/operator.repository.js";
import type { OpportunityCategoryRepository } from "../../../domain/ports/outbound/persistence/opportunity-category.repository.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";
import {
  BenefitInputSchema,
  LocalizedMetadataListInputSchema,
  PlaceIdsInputSchema,
  validateExistence,
} from "./opportunity-input.js";

const CreateOperatorOpportunityInputSchema = z.object({
  beneficiaryBenefit: BenefitInputSchema,
  caregiverBenefit: BenefitInputSchema.optional(),
  categoryId: z.ulid(),
  dateFrom: z.iso.date(),
  dateTo: z.iso.date().optional(),
  localizedMetadata: LocalizedMetadataListInputSchema,
  nationalTerritory: z.boolean().default(false),
  operatorId: z.ulid(),
  placeIds: PlaceIdsInputSchema.default([]),
  url: z.url().max(2048).optional(),
});

export type CreateOperatorOpportunityInput = z.input<
  typeof CreateOperatorOpportunityInputSchema
>;

export type CreateOperatorOpportunityUseCase = UseCase<
  CreateOperatorOpportunityInput,
  OpportunityDetail,
  BaseError
>;

const addBenefitId = (input: z.infer<typeof BenefitInputSchema>): Benefit => ({
  ...input,
  id: ulid(),
});

export const makeCreateOperatorOpportunityUseCase =
  (deps: {
    operatorRepository: OperatorRepository;
    opportunityCategoryRepository: OpportunityCategoryRepository;
    opportunityRepository: OpportunityRepository;
    placeRepository: PlaceRepository;
  }): CreateOperatorOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(CreateOperatorOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        validateExistence({
          categoryId: validatedInput.categoryId,
          operatorId: validatedInput.operatorId,
          operatorRepository: deps.operatorRepository,
          opportunityCategoryRepository: deps.opportunityCategoryRepository,
          placeIds: validatedInput.placeIds,
          placeRepository: deps.placeRepository,
        }).andThen(() => {
          const opportunity = {
            beneficiaryBenefit: addBenefitId(validatedInput.beneficiaryBenefit),
            caregiverBenefit: validatedInput.caregiverBenefit
              ? addBenefitId(validatedInput.caregiverBenefit)
              : undefined,
            categoryId: validatedInput.categoryId,
            dateFrom: validatedInput.dateFrom,
            dateTo: validatedInput.dateTo,
            id: ulid(),
            localizedMetadata: validatedInput.localizedMetadata.map((lm) => ({
              ...lm,
              id: ulid(),
            })),
            nationalTerritory: validatedInput.nationalTerritory,
            placeIds: validatedInput.placeIds,
            status: "draft" as const,
            url: validatedInput.url,
          };

          return new ResultAsync(
            deps.opportunityRepository.create({
              operatorId: validatedInput.operatorId,
              opportunity,
            }),
          );
        }),
    );
