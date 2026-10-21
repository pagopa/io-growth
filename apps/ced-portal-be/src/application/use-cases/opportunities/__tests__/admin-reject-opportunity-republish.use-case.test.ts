import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";

import { makeAdminRejectOpportunityRepublishUseCase } from "../admin-reject-opportunity-republish.use-case.js";
import { createMockOpportunityRepository, MOCK_OPERATOR_ID } from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

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
  categoryTitle: "Cultura e tempo libero",
  createdAt: "2026-01-01T00:00:00.000Z",
  dateFrom: "2026-01-01",
  dateTo: "2026-12-31",
  id: MOCK_OPPORTUNITY_ID,
  localizedMetadata: [{ key: "name", language: "it", value: "Discount 20%" }],
  nationalTerritory: false,
  operatorId: MOCK_OPERATOR_ID,
  placeIds: ["01JVMK3N8XQZP5T6G2WYHAB4CD"],
  republishMessage: "Abbiamo corretto le condizioni segnalate",
  republishRejectionMessage: null,
  status: "suspended",
  suspendedBy: "department",
  suspendFrom: null,
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
  ...overrides,
});

const makeDeps = (
  overrides?: Partial<Parameters<typeof createMockOpportunityRepository>[0]>,
) => ({
  opportunityRepository: createMockOpportunityRepository({
    findById: vi.fn().mockResolvedValue(ok(mockOpportunity())),
    rejectRepublishById: vi.fn().mockResolvedValue(ok(undefined)),
    ...overrides,
  }),
});

const validInput = {
  opportunityId: MOCK_OPPORTUNITY_ID,
  republishRejectionMessage: "Le condizioni non sono ancora conformi",
};

describe("makeAdminRejectOpportunityRepublishUseCase - happy path", () => {
  it("should reject a pending request", async () => {
    const deps = makeDeps();
    const useCase = makeAdminRejectOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase(validInput)).resolves.toEqual(ok(undefined));
    expect(deps.opportunityRepository.rejectRepublishById).toHaveBeenCalledWith(
      {
        opportunityId: MOCK_OPPORTUNITY_ID,
        republishRejectionMessage: validInput.republishRejectionMessage,
      },
    );
  });

  it("should trim the message before persisting it", async () => {
    const deps = makeDeps();
    const useCase = makeAdminRejectOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(
      useCase({
        ...validInput,
        republishRejectionMessage: "   Non conformi   ",
      }),
    ).resolves.toEqual(ok(undefined));
    expect(deps.opportunityRepository.rejectRepublishById).toHaveBeenCalledWith(
      {
        opportunityId: MOCK_OPPORTUNITY_ID,
        republishRejectionMessage: "Non conformi",
      },
    );
  });
});

describe("makeAdminRejectOpportunityRepublishUseCase - guard", () => {
  it("should return NotFoundError when the opportunity does not exist", async () => {
    const deps = makeDeps({
      findById: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeAdminRejectOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase(validInput)).resolves.toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(
      deps.opportunityRepository.rejectRepublishById,
    ).not.toHaveBeenCalled();
  });

  it.each([
    "draft",
    "test_pending",
    "test_rejected",
    "test_passed",
    "published",
    "deleted",
  ] as const)(
    "should return PreconditionFailedError when the opportunity is %s",
    async (status) => {
      const deps = makeDeps({
        findById: vi.fn().mockResolvedValue(ok(mockOpportunity({ status }))),
      });
      const useCase = makeAdminRejectOpportunityRepublishUseCase(
        deps.opportunityRepository,
      );

      await expect(useCase(validInput)).resolves.toEqual(
        err(
          expect.objectContaining({
            kind: "PreconditionFailedError",
            message:
              "Precondition failed: Opportunity must be suspended to reject its republication",
          }),
        ),
      );
    },
  );

  it("should refuse when no request is pending", async () => {
    const deps = makeDeps({
      findById: vi
        .fn()
        .mockResolvedValue(ok(mockOpportunity({ republishMessage: null }))),
    });
    const useCase = makeAdminRejectOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase(validInput)).resolves.toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: No republish request is pending on this opportunity",
        }),
      ),
    );
    expect(
      deps.opportunityRepository.rejectRepublishById,
    ).not.toHaveBeenCalled();
  });
});

describe("makeAdminRejectOpportunityRepublishUseCase - error propagation", () => {
  it("should return ConflictError when the state changed concurrently", async () => {
    const deps = makeDeps({
      rejectRepublishById: vi
        .fn()
        .mockResolvedValue(
          err(
            new ConflictError("Opportunity status was modified concurrently"),
          ),
        ),
    });
    const useCase = makeAdminRejectOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase(validInput)).resolves.toEqual(
      err(expect.objectContaining({ kind: "ConflictError" })),
    );
  });

  it("should propagate an error from the read", async () => {
    const repoError = new GenericError("DB connection failed");
    const deps = makeDeps({
      findById: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeAdminRejectOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase(validInput)).resolves.toEqual(err(repoError));
  });
});

describe("makeAdminRejectOpportunityRepublishUseCase - input validation", () => {
  it.each([
    ["opportunityId not a ULID", { opportunityId: "not-a-ulid" }],
    ["empty message", { republishRejectionMessage: "" }],
    ["whitespace-only message", { republishRejectionMessage: "   " }],
    ["message too long", { republishRejectionMessage: "x".repeat(4097) }],
  ])("should return ValidationError on %s", async (_label, override) => {
    const deps = makeDeps();
    const useCase = makeAdminRejectOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase({ ...validInput, ...override })).resolves.toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.findById).not.toHaveBeenCalled();
  });
});
