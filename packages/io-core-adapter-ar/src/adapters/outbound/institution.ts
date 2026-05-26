import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { InstitutionRepository } from "../../domain/ports/outbound/institution.repository.js";
import type { ArClientConfig } from "../../fetcher.js";

import { initArClient } from "../../fetcher.js";
import { retrieveOnboardingOnSearchEngine } from "../../generated/endpoints/institution/institution.js";

export const createInstitutionClient = (
  config: ArClientConfig,
): InstitutionRepository => {
  initArClient(config);
  return {
    searchOnboardings: async (params) => {
      try {
        const response = await retrieveOnboardingOnSearchEngine(params);
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
  };
};
