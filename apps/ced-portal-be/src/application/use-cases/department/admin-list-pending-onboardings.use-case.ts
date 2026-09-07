import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type {
  Onboarding,
  PaginatedOnboardings,
} from "../../../domain/entities/onboarding.js";
import type { OnboardingRepository } from "../../../domain/ports/outbound/onboarding.repository.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import { OnboardingStatusSchema } from "../../../domain/entities/onboarding.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const AdminListPendingOnboardingsInputSchema = z.object({
  name: z.string().optional(),
  page: z.number().int().min(0).default(0),
  size: z.number().int().min(1).max(100).default(20),
  statuses: z.array(OnboardingStatusSchema).optional(),
});

export type AdminListPendingOnboardingsInput = z.infer<
  typeof AdminListPendingOnboardingsInputSchema
>;

export type AdminListPendingOnboardingsUseCase = UseCase<
  AdminListPendingOnboardingsInput,
  PaginatedOnboardings,
  GenericError | ValidationError
>;

const withOpportunityCount = (
  item: Onboarding,
  counts?: ReadonlyMap<string, number>,
): Onboarding => ({
  ...item,
  opportunityCount:
    item.status !== "PENDING_IN_REVIEW" && item.institution?.id
      ? (counts?.get(item.institution.id) ?? 0)
      : 0,
});

const enrichWithOpportunityCounts = (
  items: readonly Onboarding[],
  countByExternalOperatorIds: OpportunityRepository["countByExternalOperatorIds"],
): ResultAsync<readonly Onboarding[], GenericError | ValidationError> => {
  const externalOperatorIds = items.reduce<string[]>((acc, item) => {
    if (item.status !== "PENDING_IN_REVIEW" && item.institution?.id) {
      acc.push(item.institution.id);
    }
    return acc;
  }, []);

  if (externalOperatorIds.length === 0) {
    return ResultAsync.fromSafePromise(
      Promise.resolve(items.map((item) => withOpportunityCount(item))),
    );
  }

  return new ResultAsync(
    countByExternalOperatorIds(externalOperatorIds).then((countsResult) =>
      countsResult.map((counts) =>
        items.map((item) => withOpportunityCount(item, counts)),
      ),
    ),
  );
};

export const makeAdminListPendingOnboardingsUseCase =
  (
    arOnboardingRepository: OnboardingRepository,
    opportunityRepository: Pick<
      OpportunityRepository,
      "countByExternalOperatorIds"
    >,
    productId: string,
  ): AdminListPendingOnboardingsUseCase =>
  async (input) =>
    validateUseCaseInput(AdminListPendingOnboardingsInputSchema, input)
      .andThen(
        (validatedInput) =>
          new ResultAsync(
            arOnboardingRepository.listByProduct({
              name: validatedInput.name,
              page: validatedInput.page,
              productId,
              size: validatedInput.size,
              statuses: validatedInput.statuses,
            }),
          ),
      )
      .andThen((paginated) =>
        enrichWithOpportunityCounts(
          paginated.items,
          opportunityRepository.countByExternalOperatorIds,
        ).map((enrichedItems) => ({
          count: paginated.count,
          items: [...enrichedItems],
        })),
      );
