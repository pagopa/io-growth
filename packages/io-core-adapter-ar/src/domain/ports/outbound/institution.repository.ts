import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type {
  OnboardingIndexSearchResource,
  RetrieveOnboardingOnSearchEngineParams,
} from "../../../generated/model/index.js";

export interface InstitutionRepository {
  readonly searchOnboardings: (
    params?: RetrieveOnboardingOnSearchEngineParams,
  ) => Promise<Result<OnboardingIndexSearchResource, GenericError>>;
}
