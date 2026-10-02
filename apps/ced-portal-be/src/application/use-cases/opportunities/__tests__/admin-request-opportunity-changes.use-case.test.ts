import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";

import { makeAdminRequestOpportunityChangesUseCase } from "../admin-request-opportunity-changes.use-case.js";
import { createMockOpportunityRepository } from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const mockOpportunity = (
  status: OpportunityDetail["status"] = "test_pending",
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
  placeIds: ["01JVMK3N8XQZP5T6G2WYHAB4CD"],
  status,
  suspendedBy: null,
  suspendFrom: null,
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
});

const makeDeps = (
  overrides?: Partial<Parameters<typeof createMockOpportunityRepository>[0]>,
) => ({
  opportunityRepository: createMockOpportunityRepository({
    findById: vi.fn().mockResolvedValue(ok(mockOpportunity())),
    requestChangesById: vi.fn().mockResolvedValue(ok(undefined)),
    ...overrides,
  }),
});

const validInput = {
  changeRequestMessage: "Correggere il titolo e la data di fine",
  opportunityId: MOCK_OPPORTUNITY_ID,
};

describe("makeAdminRequestOpportunityChangesUseCase - happy path", () => {
  it("should request changes on an opportunity under review", async () => {
    const deps = makeDeps();
    const useCase = makeAdminRequestOpportunityChangesUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.opportunityRepository.requestChangesById).toHaveBeenCalledWith({
      changeRequestMessage: validInput.changeRequestMessage,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });
  });

  it("should trim the message before persisting it", async () => {
    const deps = makeDeps();
    const useCase = makeAdminRequestOpportunityChangesUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase({
      ...validInput,
      changeRequestMessage: "   Correggere il titolo   ",
    });

    expect(result).toEqual(ok(undefined));
    expect(deps.opportunityRepository.requestChangesById).toHaveBeenCalledWith({
      changeRequestMessage: "Correggere il titolo",
      opportunityId: MOCK_OPPORTUNITY_ID,
    });
  });
});

describe("makeAdminRequestOpportunityChangesUseCase - guard", () => {
  it("should return NotFoundError when the opportunity does not exist", async () => {
    const deps = makeDeps({
      findById: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeAdminRequestOpportunityChangesUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(
      deps.opportunityRepository.requestChangesById,
    ).not.toHaveBeenCalled();
  });

  it.each([
    "draft",
    "test_rejected",
    "test_passed",
    "published",
    "scheduled",
    "scheduled_suspension",
    "suspended",
    "deleted",
  ] as const)(
    "should return PreconditionFailedError when the opportunity is %s",
    async (status) => {
      const deps = makeDeps({
        findById: vi.fn().mockResolvedValue(ok(mockOpportunity(status))),
      });
      const useCase = makeAdminRequestOpportunityChangesUseCase(
        deps.opportunityRepository,
      );

      const result = await useCase(validInput);

      expect(result).toEqual(
        err(
          expect.objectContaining({
            kind: "PreconditionFailedError",
            message:
              "Precondition failed: Opportunity must be in test_pending status to request changes",
          }),
        ),
      );
      expect(
        deps.opportunityRepository.requestChangesById,
      ).not.toHaveBeenCalled();
    },
  );
});

describe("makeAdminRequestOpportunityChangesUseCase - error propagation", () => {
  it("should return ConflictError when the status changed concurrently", async () => {
    const deps = makeDeps({
      requestChangesById: vi
        .fn()
        .mockResolvedValue(
          err(
            new ConflictError("Opportunity status was modified concurrently"),
          ),
        ),
    });
    const useCase = makeAdminRequestOpportunityChangesUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ConflictError" })),
    );
  });

  it("should propagate an error from findById", async () => {
    const repoError = new GenericError("DB connection failed");
    const deps = makeDeps({
      findById: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeAdminRequestOpportunityChangesUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
    expect(
      deps.opportunityRepository.requestChangesById,
    ).not.toHaveBeenCalled();
  });
});

describe("makeAdminRequestOpportunityChangesUseCase - input validation", () => {
  it("should return ValidationError when opportunityId is not a ULID", async () => {
    const deps = makeDeps();
    const useCase = makeAdminRequestOpportunityChangesUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase({
      ...validInput,
      opportunityId: "not-a-ulid",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.findById).not.toHaveBeenCalled();
  });

  it.each([
    ["empty", ""],
    ["whitespace only", "   "],
  ])(
    "should return ValidationError when the message is %s",
    async (_label, changeRequestMessage) => {
      const deps = makeDeps();
      const useCase = makeAdminRequestOpportunityChangesUseCase(
        deps.opportunityRepository,
      );

      const result = await useCase({ ...validInput, changeRequestMessage });

      expect(result).toEqual(
        err(expect.objectContaining({ kind: "ValidationError" })),
      );
      expect(deps.opportunityRepository.findById).not.toHaveBeenCalled();
    },
  );

  it("should return ValidationError when the message exceeds 4096 characters", async () => {
    const deps = makeDeps();
    const useCase = makeAdminRequestOpportunityChangesUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase({
      ...validInput,
      changeRequestMessage: "x".repeat(4097),
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.findById).not.toHaveBeenCalled();
  });

  it("should accept a message of exactly 4096 characters", async () => {
    const deps = makeDeps();
    const useCase = makeAdminRequestOpportunityChangesUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase({
      ...validInput,
      changeRequestMessage: "x".repeat(4096),
    });

    expect(result).toEqual(ok(undefined));
  });
});
