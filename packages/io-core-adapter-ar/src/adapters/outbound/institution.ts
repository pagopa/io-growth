import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { InstitutionRepository } from "../../domain/ports/outbound/institution.repository.js";
import type { CustomFetch } from "../../fetch.js";
import type { retrieveOnboardingOnSearchEngineResponse } from "../../generated/endpoints/institution/institution.js";

import { getRetrieveOnboardingOnSearchEngineUrl } from "../../generated/endpoints/institution/institution.js";

export const createInstitutionClient = (
  customFetch: CustomFetch,
): InstitutionRepository => ({
  searchOnboardings: async (params) => {
    try {
      const response =
        await customFetch<retrieveOnboardingOnSearchEngineResponse>(
          getRetrieveOnboardingOnSearchEngineUrl(params),
          { method: "GET" },
        );
      if (response.status === 200) {
        return ok(response.data);
      }
      return err(
        new GenericError(
          `searchOnboardings failed with status ${String(response.status)}`,
        ),
      );
    } catch (error) {
      return err(
        new GenericError(`searchOnboardings failed: ${String(error)}`),
      );
    }
  },
});
