import { GenericError } from "@pagopa/io-core-domain/errors";
import { getApplicationDate } from "@pagopa/io-core-domain/utilities";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";

import { makeOperatorRepublishOpportunityUseCase } from "../operator-republish-opportunity.use-case.js";
import {
  createMockMaterializedViewRepository,
  createMockOpportunityRepository,
  createMockProfileRepository,
  MOCK_ADMIN_EMAIL,
  MOCK_EMAIL_LINKS,
  MOCK_MAILING_CONFIG,
  MOCK_OPERATOR_ID,
  mockProfile,
} from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";
const YESTERDAY = getApplicationDate(new Date(Date.now() - 86_400_000));
const TODAY = getApplicationDate();

const mockOpportunity = (
  overrides: Partial<OpportunityDetail> = {},
): OpportunityDetail => ({
  beneficiaryBenefit: {
    discountType: "percentage",
    type: "discount",
    value: 20,
  },
  caregiverBenefit: { type: "free" },
  categoryId: "01KRJXEYD44B58700GT982CCYY",
  categoryLabel: "culture_sport",
  createdAt: "2026-01-01T00:00:00.000Z",
  dateFrom: "2026-01-01",
  dateTo: "2099-12-31",
  id: MOCK_OPPORTUNITY_ID,
  localizedMetadata: [{ key: "name", language: "it", value: "Discount 20%" }],
  nationalTerritory: false,
  placeIds: ["01JVMK3N8XQZP5T6G2WYHAB4CD"],
  status: "suspended",
  suspendedBy: "operator",
  suspendFrom: null,
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
  ...overrides,
});

const makeDeps = (overrides?: {
  found?: OpportunityDetail | undefined;
  profile?: typeof mockProfile | undefined;
  profileLookupFails?: boolean;
  refreshFails?: boolean;
}) => ({
  materializedViewRepository: createMockMaterializedViewRepository({
    refreshAll: vi
      .fn()
      .mockResolvedValue(
        overrides?.refreshFails ? err(new GenericError("boom")) : ok(undefined),
      ),
  }),
  opportunityRepository: createMockOpportunityRepository({
    findByIdAndOperatorId: vi
      .fn()
      .mockResolvedValue(
        ok("found" in (overrides ?? {}) ? overrides?.found : mockOpportunity()),
      ),
    republishByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
  }),
  profileRepository: createMockProfileRepository({
    getByOperatorId: vi
      .fn()
      .mockResolvedValue(
        overrides?.profileLookupFails
          ? err(new GenericError("profile down"))
          : ok(
              "profile" in (overrides ?? {}) ? overrides?.profile : mockProfile,
            ),
      ),
  }),
});

const makeUseCase = (deps: ReturnType<typeof makeDeps>) =>
  makeOperatorRepublishOpportunityUseCase(
    deps.opportunityRepository,
    deps.materializedViewRepository,
    deps.profileRepository,
    MOCK_MAILING_CONFIG,
  );

const validInput = {
  operatorId: MOCK_OPERATOR_ID,
  opportunityId: MOCK_OPPORTUNITY_ID,
};

describe("makeOperatorRepublishOpportunityUseCase", () => {
  it("should republish its own suspended opportunity and refresh the views", async () => {
    const deps = makeDeps();

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.republishByIdAndOperatorId,
    ).toHaveBeenCalledWith({
      ...validInput,
      outboxMessages: [
        {
          templateAttributes: {
            operatorName: mockProfile.displayName,
            opportunityName: "Discount 20%",
            ...MOCK_EMAIL_LINKS,
          },
          templateId: "ced_admin-opportunity-republished_v1",
          to: MOCK_ADMIN_EMAIL,
          type: "template",
        },
      ],
    });
    expect(deps.profileRepository.getByOperatorId).toHaveBeenCalledWith(
      MOCK_OPERATOR_ID,
    );
    expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledWith();
  });

  it.each([
    ["the operator profile lookup fails", { profileLookupFails: true }],
    ["the operator has no profile", { profile: undefined }],
  ])(
    "should republish without notifying the department when %s",
    async (_, overrides) => {
      const deps = makeDeps(overrides);

      const result = await makeUseCase(deps)(validInput);

      expect(result).toEqual(ok(undefined));
      expect(
        deps.opportunityRepository.republishByIdAndOperatorId,
      ).toHaveBeenCalledWith({ ...validInput, outboxMessages: [] });
    },
  );

  it("should read the opportunity scoped to the operator in session", async () => {
    const deps = makeDeps();

    await makeUseCase(deps)(validInput);

    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).toHaveBeenCalledWith(validInput);
  });

  it("should return NotFoundError when the opportunity does not exist or belongs to another operator", async () => {
    const deps = makeDeps({ found: undefined });

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(
      deps.opportunityRepository.republishByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should refuse an opportunity suspended by the department", async () => {
    const deps = makeDeps({
      found: mockOpportunity({ suspendedBy: "department" }),
    });

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "PreconditionFailedError" })),
    );
    expect(
      deps.opportunityRepository.republishByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it.each(["published", "draft", "test_pending"] as const)(
    "should refuse an opportunity in status %s",
    async (status) => {
      const deps = makeDeps({ found: mockOpportunity({ status }) });

      const result = await makeUseCase(deps)(validInput);

      expect(result).toEqual(
        err(expect.objectContaining({ kind: "PreconditionFailedError" })),
      );
    },
  );

  it.each([YESTERDAY, TODAY])(
    "should refuse to republish an opportunity whose end date is %s",
    async (dateTo) => {
      const deps = makeDeps({ found: mockOpportunity({ dateTo }) });

      const result = await makeUseCase(deps)(validInput);

      expect(result).toEqual(
        err(expect.objectContaining({ kind: "PreconditionFailedError" })),
      );
      expect(
        deps.opportunityRepository.republishByIdAndOperatorId,
      ).not.toHaveBeenCalled();
    },
  );

  it("should accept an opportunity with no end date", async () => {
    const deps = makeDeps({ found: mockOpportunity({ dateTo: null }) });

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(ok(undefined));
  });

  it("should succeed even when refreshing the materialized views fails", async () => {
    const deps = makeDeps({ refreshFails: true });

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(ok(undefined));
  });

  it("should return ValidationError when the opportunityId is not a ULID", async () => {
    const deps = makeDeps();

    const result = await makeUseCase(deps)({
      ...validInput,
      opportunityId: "not-a-ulid",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });
});
