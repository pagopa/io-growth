import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";

import { makeDeleteOpportunityUseCase } from "../delete-opportunity.use-case.js";
import { createMockOpportunityRepository, MOCK_OPERATOR_ID } from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const mockOpportunity = (
  status: OpportunityDetail["status"],
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
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
});

const makeDeps = (overrides?: {
  opportunityRepository?: Partial<
    Parameters<typeof createMockOpportunityRepository>[0]
  >;
}) => ({
  opportunityRepository: createMockOpportunityRepository(
    overrides?.opportunityRepository,
  ),
});

const validInput = {
  operatorId: MOCK_OPERATOR_ID,
  opportunityId: MOCK_OPPORTUNITY_ID,
};

const deletableExpectedStatuses = [
  "draft",
  "published",
  "suspended",
  "test_rejected",
];

describe("makeDeleteOpportunityUseCase - deletable statuses", () => {
  it("should delete a draft opportunity without a reason", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        deleteByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("draft"))),
      },
    });
    const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.deleteByIdAndOperatorId,
    ).toHaveBeenCalledWith({
      deletionMessage: undefined,
      expectedStatuses: deletableExpectedStatuses,
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });
  });

  it.each(["test_rejected", "scheduled", "suspended"] as const)(
    "should delete a %s opportunity when a reason is provided",
    async (status) => {
      const deps = makeDeps({
        opportunityRepository: {
          deleteByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
          findByIdAndOperatorId: vi
            .fn()
            .mockResolvedValue(ok(mockOpportunity(status))),
        },
      });
      const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

      const result = await useCase({
        ...validInput,
        deletionMessage: "No longer available",
      });

      expect(result).toEqual(ok(undefined));
      expect(
        deps.opportunityRepository.deleteByIdAndOperatorId,
      ).toHaveBeenCalledWith({
        deletionMessage: "No longer available",
        expectedStatuses: deletableExpectedStatuses,
        operatorId: MOCK_OPERATOR_ID,
        opportunityId: MOCK_OPPORTUNITY_ID,
      });
    },
  );
});

describe("makeDeleteOpportunityUseCase - reason requirement", () => {
  it.each(["test_rejected", "scheduled", "suspended"] as const)(
    "should return ValidationError when deleting a %s opportunity without a reason",
    async (status) => {
      const deps = makeDeps({
        opportunityRepository: {
          findByIdAndOperatorId: vi
            .fn()
            .mockResolvedValue(ok(mockOpportunity(status))),
        },
      });
      const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

      const result = await useCase(validInput);

      expect(result).toEqual(
        err(expect.objectContaining({ kind: "ValidationError" })),
      );
      expect(
        deps.opportunityRepository.deleteByIdAndOperatorId,
      ).not.toHaveBeenCalled();
    },
  );

  it("should reject a whitespace-only reason before reaching the repository", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("suspended"))),
      },
    });
    const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

    const result = await useCase({ ...validInput, deletionMessage: "   " });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should trim surrounding whitespace from the reason", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        deleteByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("suspended"))),
      },
    });
    const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

    await useCase({ ...validInput, deletionMessage: "  Iniziativa chiusa  " });

    expect(
      deps.opportunityRepository.deleteByIdAndOperatorId,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ deletionMessage: "Iniziativa chiusa" }),
    );
  });
});

describe("makeDeleteOpportunityUseCase - status guard", () => {
  it("should return NotFoundError when the opportunity does not exist", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(
      deps.opportunityRepository.deleteByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should return PreconditionFailedError when deleting an already-effective published opportunity", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("published"))),
      },
    });
    const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: Opportunity must be suspended before deletion",
        }),
      ),
    );
    expect(
      deps.opportunityRepository.deleteByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should return PreconditionFailedError when deleting an opportunity under review", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_pending"))),
      },
    });
    const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: Opportunity cannot be deleted while under review",
        }),
      ),
    );
    expect(
      deps.opportunityRepository.deleteByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });
});

describe("makeDeleteOpportunityUseCase - error propagation", () => {
  it("should return ConflictError on concurrent modification", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        deleteByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(
            err(
              new ConflictError("Opportunity status was modified concurrently"),
            ),
          ),
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("draft"))),
      },
    });
    const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ConflictError" })),
    );
  });

  it("should propagate an error from findByIdAndOperatorId", async () => {
    const repoError = new GenericError("DB connection failed");
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi.fn().mockResolvedValue(err(repoError)),
      },
    });
    const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
    expect(
      deps.opportunityRepository.deleteByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should propagate an error from deleteByIdAndOperatorId", async () => {
    const repoError = new GenericError("DB update failed");
    const deps = makeDeps({
      opportunityRepository: {
        deleteByIdAndOperatorId: vi.fn().mockResolvedValue(err(repoError)),
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("draft"))),
      },
    });
    const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
  });
});

describe("makeDeleteOpportunityUseCase - input validation", () => {
  it("should return ValidationError when operatorId is invalid", async () => {
    const deps = makeDeps();
    const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

    const result = await useCase({
      operatorId: "invalid",
      opportunityId: MOCK_OPPORTUNITY_ID,
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should return ValidationError when opportunityId is invalid", async () => {
    const deps = makeDeps();
    const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: "not-a-ulid",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should return ValidationError when deletionMessage exceeds the max length", async () => {
    const deps = makeDeps();
    const useCase = makeDeleteOpportunityUseCase(deps.opportunityRepository);

    const result = await useCase({
      ...validInput,
      deletionMessage: "x".repeat(4097),
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });
});
