import type { UseCase } from "@pagopa/io-core-domain";
import type { GenericError } from "@pagopa/io-core-domain/errors";

import type { OpportunityCategory } from "../../../domain/entities/opportunity-category.js";
import type { OpportunityCategoryRepository } from "../../../domain/ports/outbound/persistence/opportunity-category.repository.js";

export type ListOpportunityCategoriesUseCase = UseCase<
  Record<string, never>,
  OpportunityCategory[],
  GenericError
>;

export const makeListOpportunityCategoriesUseCase =
  (
    opportunityCategoryRepository: OpportunityCategoryRepository,
  ): ListOpportunityCategoriesUseCase =>
  async () =>
    opportunityCategoryRepository.list();
