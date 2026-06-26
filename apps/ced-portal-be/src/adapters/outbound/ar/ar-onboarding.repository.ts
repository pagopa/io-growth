import type { ArClient, UserRepository } from "@pagopa/io-core-adapter-ar";
import type { EnvRouter } from "@pagopa/io-core-environment-router";

import { GenericError, NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type {
  Onboarding,
  OnboardingDetail,
} from "../../../domain/entities/onboarding.js";
import type {
  ArOnboardingRepository,
  ListOnboardingsInput,
} from "../../../domain/ports/outbound/ar-onboarding.repository.js";

import { OnboardingStatusSchema } from "../../../domain/entities/onboarding.js";

const toOnboarding = (item: {
  city?: string;
  county?: string;
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
    city: item.city,
    county: item.county,
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

const enrichManagerUser = async (
  users: OnboardingDetail["users"],
  userClient: UserRepository,
) => {
  const managerId = users?.find((user) => user.role === "MANAGER")?.id;

  if (!managerId) {
    return ok(users);
  }

  const managerResult = await userClient.getUserById(managerId);

  if (managerResult.isErr()) {
    // Enriching the manager user is best-effort: if the user lookup fails
    // (e.g. the user no longer exists), return the un-enriched users instead
    // of failing the whole onboarding detail request.
    return ok(users);
  }

  const { email, name, surname } = managerResult.value;

  return ok(
    users?.map((user) =>
      user.id === managerId ? { ...user, email, name, surname } : user,
    ),
  );
};

export const createArOnboardingRepository = (
  arClientRouter: EnvRouter<ArClient>,
): ArOnboardingRepository => {
  const arClient = arClientRouter.getInstance();
  return {
    completeOnboarding: async (input) =>
      arClient.onboardingClient.completeOnboarding(input.onboardingId, {
        contract: input.contract,
      }),

    getById: async (onboardingId) => {
      const result = await arClient.onboardingClient.getOnboardingWithFilter({
        onboardingId,
      });

      if (result.isErr()) {
        return err(new GenericError(result.error.message));
      }

      const item = result.value.items?.[0];
      if (!item) {
        return err(
          new NotFoundError(
            "Onboarding",
            `Onboarding not found: ${onboardingId}`,
          ),
        );
      }

      const usersResult = await enrichManagerUser(
        item.users,
        arClient.userClient,
      );

      const onboardingDetail: OnboardingDetail = {
        activatedAt: item.activatedAt,
        additionalInformations: item.additionalInformations
          ? {
              agentOfPublicService:
                item.additionalInformations.agentOfPublicService,
              agentOfPublicServiceNote:
                item.additionalInformations.agentOfPublicServiceNote,
              belongRegulatedMarket:
                item.additionalInformations.belongRegulatedMarket,
              establishedByRegulatoryProvision:
                item.additionalInformations.establishedByRegulatoryProvision,
              establishedByRegulatoryProvisionNote:
                item.additionalInformations
                  .establishedByRegulatoryProvisionNote,
              ipa: item.additionalInformations.ipa,
              ipaCode: item.additionalInformations.ipaCode,
              otherNote: item.additionalInformations.otherNote,
              regulatedMarketNote:
                item.additionalInformations.regulatedMarketNote,
            }
          : undefined,
        attachments: item.attachments,
        billing: item.billing
          ? {
              publicServices: item.billing.publicServices,
              recipientCode: item.billing.recipientCode,
              vatNumber: item.billing.vatNumber,
            }
          : undefined,
        createdAt: item.createdAt,
        expiringDate: item.expiringDate,
        id: item.id,
        institution: item.institution
          ? {
              address: item.institution.address,
              atecoCodes: item.institution.atecoCodes,
              businessRegisterPlace: item.institution.businessRegisterPlace,
              city: item.institution.city,
              country: item.institution.country,
              county: item.institution.county,
              dataProtectionOfficer: item.institution.dataProtectionOfficer
                ? {
                    address: item.institution.dataProtectionOfficer.address,
                    email: item.institution.dataProtectionOfficer.email,
                    pec: item.institution.dataProtectionOfficer.pec,
                  }
                : undefined,
              description: item.institution.description,
              digitalAddress: item.institution.digitalAddress,
              geographicTaxonomies: item.institution.geographicTaxonomies?.map(
                (taxonomy) => ({
                  code: taxonomy.code,
                  desc: taxonomy.desc,
                }),
              ),
              id: item.institution.id,
              institutionType: item.institution.institutionType,
              legalForm: item.institution.legalForm,
              origin: item.institution.origin,
              originId: item.institution.originId,
              parentDescription: item.institution.parentDescription,
              paymentServiceProvider: item.institution.paymentServiceProvider
                ? {
                    abiCode: item.institution.paymentServiceProvider.abiCode,
                    businessRegisterNumber:
                      item.institution.paymentServiceProvider
                        .businessRegisterNumber,
                    contractId:
                      item.institution.paymentServiceProvider.contractId,
                    contractType:
                      item.institution.paymentServiceProvider.contractType,
                    legalRegisterName:
                      item.institution.paymentServiceProvider.legalRegisterName,
                    legalRegisterNumber:
                      item.institution.paymentServiceProvider
                        .legalRegisterNumber,
                    longTermPayments:
                      item.institution.paymentServiceProvider.longTermPayments,
                    providerNames:
                      item.institution.paymentServiceProvider.providerNames,
                    vatNumberGroup:
                      item.institution.paymentServiceProvider.vatNumberGroup,
                  }
                : undefined,
              rea: item.institution.rea,
              shareCapital: item.institution.shareCapital,
              subunitCode: item.institution.subunitCode,
              subunitType: item.institution.subunitType,
              supportEmail: item.institution.supportEmail,
              supportPhone: item.institution.supportPhone,
              taxCode: item.institution.taxCode,
              taxCodeInvoicing: item.institution.taxCodeInvoicing,
              zipCode: item.institution.zipCode,
            }
          : undefined,
        payment: item.payment
          ? {
              holder: item.payment.holder,
              iban: item.payment.iban,
            }
          : undefined,
        pricingPlan: item.pricingPlan,
        productId: item.productId,
        reasonForReject: item.reasonForReject,
        signContract: item.signContract,
        status: item.status,
        updatedAt: item.updatedAt,
        userRequester: item.userRequester
          ? {
              userMailUuid: item.userRequester.userMailUuid,
              userRequestUid: item.userRequester.userRequestUid,
            }
          : undefined,
        users: usersResult.value,
        workflowType: item.workflowType,
      };

      return ok(onboardingDetail);
    },

    getContractSigned: async (onboardingId) =>
      arClient.documentContentClient.getContractSigned(onboardingId),

    listByProduct: async (input: ListOnboardingsInput) => {
      const result = await arClient.institutionClient.searchOnboardings({
        page: input.page,
        pageSize: input.size,
        products: [input.productId],
        ...(input.name ? { searchText: input.name } : {}),
        ...(input.statuses && {
          statuses: input.statuses,
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
  };
};
