import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { HealthRepository } from "../../domain/ports/outbound/health.repository.js";
import type { CustomFetch } from "../../fetch.js";
import type {
  getHealthReadyResponse,
  getHealthResponse,
} from "../../generated/endpoints/health/health.js";

import {
  getGetHealthReadyUrl,
  getGetHealthUrl,
} from "../../generated/endpoints/health/health.js";

/** Creates the OneMail Health outbound adapter. */
export const createHealthClient = (
  customFetch: CustomFetch,
): HealthRepository => ({
  checkLiveness: async () => {
    try {
      const response = await customFetch<getHealthResponse>(getGetHealthUrl(), {
        method: "GET",
      });
      if (response.status === 200) return ok(response.data);
      return err(
        new GenericError(
          `checkLiveness failed with status ${String(response.status)}`,
        ),
      );
    } catch (error) {
      return err(new GenericError(`checkLiveness failed: ${String(error)}`));
    }
  },

  checkReadiness: async () => {
    try {
      const response = await customFetch<getHealthReadyResponse>(
        getGetHealthReadyUrl(),
        { method: "GET" },
      );
      if (response.status === 200) return ok(response.data);
      return err(
        new GenericError(
          `checkReadiness failed with status ${String(response.status)}`,
        ),
      );
    } catch (error) {
      return err(new GenericError(`checkReadiness failed: ${String(error)}`));
    }
  },
});
