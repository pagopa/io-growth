import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";

import { makeOperatorRequestOpportunityTestUseCase } from "../operator-request-opportunity-test.use-case.js";
import { createMockOpportunityRepository, MOCK_OPERATOR_ID } from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const mockDraftOpportunityDetail: OpportunityDetail = {
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
  status: "draft",
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
};

describe("makeOperatorRequestOpportunityTestUseCase", () => {
  it("should update status to test_pending when opportunity is in draft", async () => {
    const repository = createMockOpportunityRepository({
      findByIdAndOperatorId: vi
        .fn()
        .mockResolvedValue(ok(mockDraftOpportunityDetail)),
      updateStatusByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeOperatorRequestOpportunityTestUseCase(repository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });

    expect(result).toEqual(ok(undefined));
    expect(repository.findByIdAndOperatorId).toHaveBeenCalledWith({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });
    expect(repository.updateStatusByIdAndOperatorId).toHaveBeenCalledWith({
      expectedStatus: "draft",
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
      status: "test_pending",
    });
  });

  it("should return NotFoundError when opportunity does not exist", async () => {
    const repository = createMockOpportunityRepository({
      findByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeOperatorRequestOpportunityTestUseCase(repository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "NotFoundError",
        }),
      ),
    );
    expect(repository.updateStatusByIdAndOperatorId).not.toHaveBeenCalled();
  });

  it("should return PreconditionFailedError when opportunity is not in draft status", async () => {
    const publishedOpportunity: OpportunityDetail = {
      ...mockDraftOpportunityDetail,
      status: "published",
    };
    const repository = createMockOpportunityRepository({
      findByIdAndOperatorId: vi
        .fn()
        .mockResolvedValue(ok(publishedOpportunity)),
    });
    const useCase = makeOperatorRequestOpportunityTestUseCase(repository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: Opportunity must be in draft status to request testing",
        }),
      ),
    );
    expect(repository.updateStatusByIdAndOperatorId).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from findByIdAndOperatorId", async () => {
    const repoError = new GenericError("DB connection failed");
    const repository = createMockOpportunityRepository({
      findByIdAndOperatorId: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeOperatorRequestOpportunityTestUseCase(repository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });

    expect(result).toEqual(err(repoError));
    expect(repository.updateStatusByIdAndOperatorId).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from updateStatusByIdAndOperatorId", async () => {
    const repoError = new GenericError("DB update failed");
    const repository = createMockOpportunityRepository({
      findByIdAndOperatorId: vi
        .fn()
        .mockResolvedValue(ok(mockDraftOpportunityDetail)),
      updateStatusByIdAndOperatorId: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeOperatorRequestOpportunityTestUseCase(repository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });

    expect(result).toEqual(err(repoError));
  });

  it("should return ConflictError when opportunity status was modified concurrently", async () => {
    const conflictError = new ConflictError(
      "Opportunity status was modified concurrently",
    );
    const repository = createMockOpportunityRepository({
      findByIdAndOperatorId: vi
        .fn()
        .mockResolvedValue(ok(mockDraftOpportunityDetail)),
      updateStatusByIdAndOperatorId: vi
        .fn()
        .mockResolvedValue(err(conflictError)),
    });
    const useCase = makeOperatorRequestOpportunityTestUseCase(repository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "ConflictError",
        }),
      ),
    );
  });

  it("should return ValidationError when operatorId is invalid", async () => {
    const repository = createMockOpportunityRepository();
    const useCase = makeOperatorRequestOpportunityTestUseCase(repository);

    const result = await useCase({
      operatorId: "invalid",
      opportunityId: MOCK_OPPORTUNITY_ID,
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(repository.findByIdAndOperatorId).not.toHaveBeenCalled();
  });

  it("should return ValidationError when opportunityId is invalid", async () => {
    const repository = createMockOpportunityRepository();
    const useCase = makeOperatorRequestOpportunityTestUseCase(repository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: "not-a-ulid",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(repository.findByIdAndOperatorId).not.toHaveBeenCalled();
  });
});

describe("makeOperatorRequestOpportunityTestUseCase - place coverage", () => {
  it("should return PreconditionFailedError when opportunity has neither places nor national territory", async () => {
    const opportunityWithoutCoverage: OpportunityDetail = {
      ...mockDraftOpportunityDetail,
      nationalTerritory: false,
      placeIds: [],
    };
    const repository = createMockOpportunityRepository({
      findByIdAndOperatorId: vi
        .fn()
        .mockResolvedValue(ok(opportunityWithoutCoverage)),
    });
    const useCase = makeOperatorRequestOpportunityTestUseCase(repository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: Opportunity must have at least one place or be valid on the national territory to request testing",
        }),
      ),
    );
    expect(repository.updateStatusByIdAndOperatorId).not.toHaveBeenCalled();
  });

  it("should request testing when opportunity has no places but covers the national territory", async () => {
    const nationalOpportunity: OpportunityDetail = {
      ...mockDraftOpportunityDetail,
      nationalTerritory: true,
      placeIds: [],
    };
    const repository = createMockOpportunityRepository({
      findByIdAndOperatorId: vi.fn().mockResolvedValue(ok(nationalOpportunity)),
      updateStatusByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeOperatorRequestOpportunityTestUseCase(repository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });

    expect(result).toEqual(ok(undefined));
    expect(repository.updateStatusByIdAndOperatorId).toHaveBeenCalledWith({
      expectedStatus: "draft",
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
      status: "test_pending",
    });
  });
});
