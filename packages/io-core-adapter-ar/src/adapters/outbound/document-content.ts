import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { DocumentContentRepository } from "../../domain/ports/outbound/document-content.repository.js";
import type { CustomFetch } from "../../fetch.js";
import type { getContractSignedResponse } from "../../generated/endpoints/document-content-controller/document-content-controller.js";

import { getGetContractSignedUrl } from "../../generated/endpoints/document-content-controller/document-content-controller.js";

export const createDocumentContentClient = (
  customFetch: CustomFetch,
): DocumentContentRepository => ({
  getContractSigned: async (onboardingId) => {
    try {
      const response = await customFetch<getContractSignedResponse>(
        getGetContractSignedUrl(onboardingId),
        { method: "GET" },
      );
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
});
