import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { DocumentContentRepository } from "../../domain/ports/outbound/document-content.repository.js";

import { getContractSigned as getContractSignedGen } from "../../generated/endpoints/document-content-controller/document-content-controller.js";

export const createDocumentContentClient = (): DocumentContentRepository => ({
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
});
