import type { BaseError } from "@pagopa/io-core-domain/errors";

import { ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { OperatorRepository } from "../../../domain/ports/outbound/persistence/operator.repository.js";
import type { OpportunityCategoryRepository } from "../../../domain/ports/outbound/persistence/opportunity-category.repository.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import {
  BENEFIT_DISCOUNT_TYPE,
  BENEFIT_TYPE,
  LANGUAGE,
  LOCALIZED_METADATA_KEY,
} from "../../../domain/entities/opportunity.js";

export const BenefitInputSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(BENEFIT_TYPE.FREE) }),
  z.object({ type: z.literal(BENEFIT_TYPE.PRIORITY) }),
  z.object({
    type: z.literal(BENEFIT_TYPE.REDUCED_FIXED_PRICE),
    value: z.number().int(),
  }),
  z.object({
    discountType: z.enum(BENEFIT_DISCOUNT_TYPE),
    type: z.literal(BENEFIT_TYPE.DISCOUNT),
    value: z.number().int(),
  }),
  z.object({
    description: z.string().min(1).max(4096),
    type: z.literal(BENEFIT_TYPE.OTHER),
  }),
]);

const LocalizedMetadataInputSchema = z.object({
  key: z.enum(LOCALIZED_METADATA_KEY),
  language: z.enum(LANGUAGE),
  value: z.string().min(1),
});

export const LocalizedMetadataListInputSchema = z
  .array(LocalizedMetadataInputSchema)
  .min(1)
  .refine(
    (metadata) =>
      metadata.some(
        (e) =>
          e.key === LOCALIZED_METADATA_KEY.NAME && e.language === LANGUAGE.IT,
      ),
    {
      message: "localizedMetadata must contain at least one Italian name entry",
    },
  );

// opportunity_place has a composite PK on (opportunityId, placeId): a
// duplicate id in the same insert statement violates it, aborting the
// transaction with a raw Postgres error (-> 500) instead of a clean 400.
export const PlaceIdsInputSchema = z
  .array(z.ulid())
  .refine((placeIds) => new Set(placeIds).size === placeIds.length, {
    message: "placeIds must not contain duplicates",
  });

export interface ValidateExistenceInput {
  readonly categoryId: string;
  readonly operatorId: string;
  readonly operatorRepository: OperatorRepository;
  readonly opportunityCategoryRepository: OpportunityCategoryRepository;
  readonly placeIds: readonly string[];
  readonly placeRepository: PlaceRepository;
}

// Verifies operator, category and places exist (and the places belong to the
// operator). Returns a ValidationError on the first missing entity.
export const validateExistence = (
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
