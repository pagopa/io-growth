import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { OpportunityCategory } from "../../../entities/opportunity-category.js";

export interface OpportunityCategoryRepository {
  readonly getById: (
    id: string,
  ) => Promise<Result<OpportunityCategory | undefined, GenericError>>;
  readonly list: () => Promise<Result<OpportunityCategory[], GenericError>>;
}
