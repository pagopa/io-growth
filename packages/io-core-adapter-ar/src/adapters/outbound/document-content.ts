import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { ArClientConfig } from "../../config.js";
import type { DocumentContentRepository } from "../../domain/ports/outbound/document-content.repository.js";

import { initArClient } from "../../client.js";
import { getContractSigned as getContractSignedGen } from "../../generated/endpoints/document-content-controller/document-content-controller.js";

export const createDocumentContentClient = (
  config: ArClientConfig,
): DocumentContentRepository => {
  initArClient(config);
  return {
    getContractSigned: async (onboardingId) => {
      try {
        const response = await getContractSignedGen(onboardingId);
        if (response.status === 200) {
          return ok(response.data);
        }
        return err(
          new GenericError(
            `getContractSigned failed with status ${String(response.status)}`,
          ),
        );
      } catch (error) {
        return err(
          new GenericError(`getContractSigned failed: ${String(error)}`),
        );
      }
    },
  };
};
