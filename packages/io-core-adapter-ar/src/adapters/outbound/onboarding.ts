import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { ArClientConfig } from "../../config.js";
import type { OnboardingRepository } from "../../domain/ports/outbound/onboarding.repository.js";

import { initArClient } from "../../client.js";
import {
  completeOnboardingUsingPUT,
  getOnboardingWithFilter,
} from "../../generated/endpoints/onboarding-controller/onboarding-controller.js";

export const createOnboardingClient = (
  config: ArClientConfig,
): OnboardingRepository => {
  initArClient(config);
  return {
    completeOnboarding: async (onboardingId, body) => {
      try {
        const response = await completeOnboardingUsingPUT(onboardingId, body);
        if (response.status === 401 || response.status === 403) {
          return err(
            new GenericError(
              `completeOnboarding failed with status ${String(response.status)}`,
            ),
          );
        }
        return ok(undefined);
      } catch (error) {
        return err(
          new GenericError(`completeOnboarding failed: ${String(error)}`),
        );
      }
    },

    getOnboardingWithFilter: async (params) => {
      try {
        const response = await getOnboardingWithFilter(params);
        if (response.status === 200) {
          return ok(response.data);
        }
        return err(
          new GenericError(
            `getOnboardingWithFilter failed with status ${String(response.status)}`,
          ),
        );
      } catch (error) {
        return err(
          new GenericError(`getOnboardingWithFilter failed: ${String(error)}`),
        );
      }
    },
  };
};
