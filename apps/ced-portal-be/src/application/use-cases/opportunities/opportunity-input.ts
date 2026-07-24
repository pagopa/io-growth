import type { BaseError } from "@pagopa/io-core-domain/errors";

import { ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { OperatorRepository } from "../../../domain/ports/outbound/persistence/operator.repository.js";
import type { OpportunityCategoryRepository } from "../../../domain/ports/outbound/persistence/opportunity-category.repository.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

export const BenefitInputSchema = z.discriminatedUnion("type", [
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

export const LocalizedMetadataListInputSchema = z
  .array(LocalizedMetadataInputSchema)
  .min(1)
  .refine(
    (metadata) => metadata.some((e) => e.key === "name" && e.language === "it"),
    {
      message: "localizedMetadata must contain at least one Italian name entry",
    },
  );

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
