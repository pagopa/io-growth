import type { UseCase } from "@pagopa/io-core-domain";

import { type BaseError, ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";
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

const BenefitInputSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("free") }),
  z.object({ type: z.literal("priority") }),
  z.object({
    type: z.literal("reduced_fixed_price"),
    value: z.number().int(),
  }),
  z.object({
    discountType: z.enum(["percentage", "fixed_amount"]),
    type: z.literal("discount"),
    value: z.number().int(),
  }),
  z.object({
    description: z.string().min(1).max(4096),
    type: z.literal("other"),
  }),
]);

const LocalizedMetadataInputSchema = z.object({
  key: z.enum(["name", "description", "condition"]),
  language: z.enum(["en", "fr", "de", "sl", "it"]),
  value: z.string().min(1),
});

const LocalizedMetadataListInputSchema = z
  .array(LocalizedMetadataInputSchema)
  .min(1)
  .refine(
    (metadata) => metadata.some((e) => e.key === "name" && e.language === "it"),
    {
      message: "localizedMetadata must contain at least one Italian name entry",
    },
  );

const CreateOperatorOpportunityInputSchema = z.object({
  beneficiaryBenefit: BenefitInputSchema,
  caregiverBenefit: BenefitInputSchema.optional(),
  categoryId: z.ulid(),
  dateFrom: z.iso.date(),
  dateTo: z.iso.date().optional(),
  localizedMetadata: LocalizedMetadataListInputSchema,
  nationalTerritory: z.boolean().default(false),
  operatorId: z.ulid(),
  placeIds: z.array(z.ulid()).default([]),
  url: z.url().max(2048).optional(),
});

export type CreateOperatorOpportunityInput = z.infer<
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

interface ValidateExistenceInput {
  readonly categoryId: string;
  readonly operatorId: string;
  readonly operatorRepository: OperatorRepository;
  readonly opportunityCategoryRepository: OpportunityCategoryRepository;
  readonly placeIds: readonly string[];
  readonly placeRepository: PlaceRepository;
}

const validateExistence = (
  input: ValidateExistenceInput,
): ResultAsync<void, BaseError> =>
  ResultAsync.fromSafePromise<
    [
      Awaited<ReturnType<OperatorRepository["getById"]>>,
      Awaited<ReturnType<OpportunityCategoryRepository["getById"]>>,
      Awaited<ReturnType<PlaceRepository["getIdsByOperator"]>>,
    ],
    never
  >(
    Promise.all([
      input.operatorRepository.getById(input.operatorId),
      input.opportunityCategoryRepository.getById(input.categoryId),
      input.placeIds.length === 0
        ? Promise.resolve(ok([]))
        : input.placeRepository.getIdsByOperator({
            operatorId: input.operatorId,
            placeIds: input.placeIds,
          }),
    ]),
  ).andThen(([operatorResult, categoryResult, placeIdsResult]) => {
    if (operatorResult.isErr()) {
      return err(operatorResult.error);
    }
    if (categoryResult.isErr()) {
      return err(categoryResult.error);
    }
    if (placeIdsResult.isErr()) {
      return err(placeIdsResult.error);
    }

    if (!operatorResult.value) {
      return err(
        new ValidationError(
          `Operator with id '${input.operatorId}' does not exist`,
        ),
      );
    }

    if (!categoryResult.value) {
      return err(
        new ValidationError(
          `Opportunity category with id '${input.categoryId}' does not exist`,
        ),
      );
    }

    const foundPlaceIds = new Set(placeIdsResult.value);
    const missingPlaceIds = input.placeIds.filter(
      (id) => !foundPlaceIds.has(id),
    );
    if (missingPlaceIds.length > 0) {
      return err(
        new ValidationError(
          `Places with ids '${missingPlaceIds.join("', '")}' do not exist or do not belong to the operator`,
        ),
      );
    }

    return ok(undefined);
  });
