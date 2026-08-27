import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { OnboardingRepository } from "../../domain/ports/outbound/onboarding.repository.js";
import type { CustomFetch } from "../../fetch.js";
import type {
  completeOnboardingUsingPUTResponse,
  getOnboardingWithFilterResponse,
} from "../../generated/endpoints/onboarding-controller/onboarding-controller.js";
import type { CompleteOnboardingUsingPUTBody } from "../../generated/model/index.js";

import {
  getCompleteOnboardingUsingPUTUrl,
  getGetOnboardingWithFilterUrl,
} from "../../generated/endpoints/onboarding-controller/onboarding-controller.js";

export const createOnboardingClient = (
  customFetch: CustomFetch,
): OnboardingRepository => ({
  completeOnboarding: async (
    onboardingId,
    body?: CompleteOnboardingUsingPUTBody,
  ) => {
    try {
      const formData = new FormData();
      if (body?.contract !== undefined) {
        formData.append("contract", body.contract);
      }
      const response = await customFetch<completeOnboardingUsingPUTResponse>(
        getCompleteOnboardingUsingPUTUrl(onboardingId),
        { body: formData, method: "PUT" },
      );
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
      const response = await customFetch<getOnboardingWithFilterResponse>(
        getGetOnboardingWithFilterUrl(params),
        { method: "GET" },
      );
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
});
