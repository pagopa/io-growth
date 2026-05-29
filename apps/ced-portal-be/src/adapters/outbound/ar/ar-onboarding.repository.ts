import type {
  DocumentContentRepository,
  InstitutionRepository,
  OnboardingRepository,
} from "@pagopa/io-core-adapter-ar";

import { GenericError, NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { Onboarding } from "../../../domain/entities/onboarding.js";
import type {
  ArOnboardingRepository,
  ListOnboardingsInput,
} from "../../../domain/ports/outbound/ar-onboarding.repository.js";

import { OnboardingStatusSchema } from "../../../domain/entities/onboarding.js";

const toOnboarding = (item: {
  createdAt?: string;
  description?: string;
  institutionId?: string;
  onboardingId: string;
  productId?: string;
  status?: string;
  taxCode?: string;
  updatedAt?: string;
}): Onboarding => {
  const institution = {
    description: item.description,
    id: item.institutionId,
    taxCode: item.taxCode,
  };

  return {
    createdAt: item.createdAt,
    id: item.onboardingId,
    institution: Object.values(institution).some((value) => value !== undefined)
      ? institution
      : undefined,
    productId: item.productId,
    status: OnboardingStatusSchema.optional()
      .catch(undefined)
      .parse(item.status),
    updatedAt: item.updatedAt,
  };
};

export const createArOnboardingRepository = (
  institutionClient: InstitutionRepository,
  onboardingClient: OnboardingRepository,
  documentContentClient: DocumentContentRepository,
): ArOnboardingRepository => ({
  completeOnboarding: async (input) =>
    onboardingClient.completeOnboarding(input.onboardingId, {
      contract: input.contract,
    }),

  getById: async (onboardingId) => {
    const result = await onboardingClient.getOnboardingWithFilter({
      onboardingId,
    });

    return result.match(
      (data) => {
        const item = data.items?.[0];
        if (!item) {
          return err(
            new NotFoundError(
              "Onboarding",
              `Onboarding not found: ${onboardingId}`,
            ),
          );
        }
        return ok({
          createdAt: item.createdAt,
          id: item.id,
          institution: item.institution
            ? {
                city: item.institution.city,
                county: item.institution.county,
                description: item.institution.description,
                digitalAddress: item.institution.digitalAddress,
                id: item.institution.id,
                taxCode: item.institution.taxCode,
              }
            : undefined,
          productId: item.productId,
          status: OnboardingStatusSchema.optional()
            .catch(undefined)
            .parse(item.status),
          updatedAt: item.updatedAt,
          workflowType: item.workflowType,
        });
      },
      (error) => err(new GenericError(error.message)),
    );
  },

  getContractSigned: async (onboardingId) =>
    documentContentClient.getContractSigned(onboardingId),

  listByProduct: async (input: ListOnboardingsInput) => {
    const result = await institutionClient.searchOnboardings({
      page: input.page,
      pageSize: input.size,
      products: [input.productId],
      ...(input.name ? { searchText: input.name } : {}),
      ...(input.status && {
        statuses: [input.status],
      }),
    });

    return result.match(
      (data) =>
        ok({
          count: data.totalElements ?? 0,
          items: (data.onboardings ?? []).map(toOnboarding),
        }),
      (error) => err(new GenericError(error.message)),
    );
  },
});
