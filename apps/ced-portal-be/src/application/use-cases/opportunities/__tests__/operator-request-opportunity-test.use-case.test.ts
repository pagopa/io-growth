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
  placeIds: ["01JVMK3N8XQZP5T6G2WYHAB4CD"],
  status: "draft",
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
};

describe("makeOperatorRequestOpportunityTestUseCase", () => {
  it("should update status to test_pending when opportunity is in draft", async () => {
    const repository = createMockOpportunityRepository({
      getById: vi.fn().mockResolvedValue(ok(mockDraftOpportunityDetail)),
      updateStatus: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeOperatorRequestOpportunityTestUseCase(repository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });

    expect(result).toEqual(ok(undefined));
    expect(repository.getById).toHaveBeenCalledWith({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });
    expect(repository.updateStatus).toHaveBeenCalledWith({
      expectedStatus: "draft",
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
      status: "test_pending",
    });
  });

  it("should return NotFoundError when opportunity does not exist", async () => {
    const repository = createMockOpportunityRepository({
      getById: vi.fn().mockResolvedValue(ok(undefined)),
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
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it("should return PreconditionFailedError when opportunity is not in draft status", async () => {
    const publishedOpportunity: OpportunityDetail = {
      ...mockDraftOpportunityDetail,
      status: "published",
    };
    const repository = createMockOpportunityRepository({
      getById: vi.fn().mockResolvedValue(ok(publishedOpportunity)),
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
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from getById", async () => {
    const repoError = new GenericError("DB connection failed");
    const repository = createMockOpportunityRepository({
      getById: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeOperatorRequestOpportunityTestUseCase(repository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });

    expect(result).toEqual(err(repoError));
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from updateStatus", async () => {
    const repoError = new GenericError("DB update failed");
    const repository = createMockOpportunityRepository({
      getById: vi.fn().mockResolvedValue(ok(mockDraftOpportunityDetail)),
      updateStatus: vi.fn().mockResolvedValue(err(repoError)),
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
      getById: vi.fn().mockResolvedValue(ok(mockDraftOpportunityDetail)),
      updateStatus: vi.fn().mockResolvedValue(err(conflictError)),
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
    expect(repository.getById).not.toHaveBeenCalled();
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
    expect(repository.getById).not.toHaveBeenCalled();
  });
});
