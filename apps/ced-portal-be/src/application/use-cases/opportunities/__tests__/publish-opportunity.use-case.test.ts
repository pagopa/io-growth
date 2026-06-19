import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";
import type { MaterializedViewRepository } from "../../../../domain/ports/outbound/materialized-view.repository.js";

import { makePublishOpportunityUseCase } from "../publish-opportunity.use-case.js";
import {
  createMockMaterializedViewRepository,
  createMockOpportunityRepository,
  MOCK_OPERATOR_ID,
} from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const mockOpportunity = (
  status: OpportunityDetail["status"],
  dateFrom = "2026-01-01",
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
  dateFrom,
  dateTo: "2026-12-31",
  id: MOCK_OPPORTUNITY_ID,
  localizedMetadata: [{ key: "name", language: "it", value: "Discount 20%" }],
  placeIds: ["01JVMK3N8XQZP5T6G2WYHAB4CD"],
  status,
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
});

const makeDeps = (overrides?: {
  materializedViewRepository?: Partial<MaterializedViewRepository>;
  opportunityRepository?: Partial<
    Parameters<typeof createMockOpportunityRepository>[0]
  >;
}) => ({
  materializedViewRepository: createMockMaterializedViewRepository(
    overrides?.materializedViewRepository,
  ),
  opportunityRepository: createMockOpportunityRepository(
    overrides?.opportunityRepository,
  ),
});

const validInput = {
  operatorId: MOCK_OPERATOR_ID,
  opportunityId: MOCK_OPPORTUNITY_ID,
};

describe("makePublishOpportunityUseCase - dateFrom refresh logic", () => {
  it("should publish and refresh views when dateFrom is in the past", async () => {
    const deps = makeDeps({
      materializedViewRepository: {
        refreshAll: vi.fn().mockResolvedValue(ok(undefined)),
      },
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_passed", "2026-01-01"))),
        updateStatusByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makePublishOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.updateStatusByIdAndOperatorId,
    ).toHaveBeenCalledWith({
      expectedStatus: "test_passed",
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
      status: "published",
    });
    expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledOnce();
  });

  it("should publish without refreshing views when dateFrom is in the future", async () => {
    const deps = makeDeps({
      materializedViewRepository: { refreshAll: vi.fn() },
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_passed", "2099-12-31"))),
        updateStatusByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makePublishOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.updateStatusByIdAndOperatorId,
    ).toHaveBeenCalledWith({
      expectedStatus: "test_passed",
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
      status: "published",
    });
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });
});

describe("makePublishOpportunityUseCase - status guard", () => {
  it("should return NotFoundError when opportunity does not exist", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makePublishOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(
      deps.opportunityRepository.updateStatusByIdAndOperatorId,
    ).not.toHaveBeenCalled();
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("should return PreconditionFailedError when status is not test_passed", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("draft"))),
      },
    });
    const useCase = makePublishOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: Opportunity must be in test_passed status to be published",
        }),
      ),
    );
    expect(
      deps.opportunityRepository.updateStatusByIdAndOperatorId,
    ).not.toHaveBeenCalled();
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("should return ConflictError on concurrent modification", async () => {
    const conflictError = new ConflictError(
      "Opportunity status was modified concurrently",
    );
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_passed"))),
        updateStatusByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(err(conflictError)),
      },
    });
    const useCase = makePublishOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ConflictError" })),
    );
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });
});

describe("makePublishOpportunityUseCase - error propagation", () => {
  it("should propagate error from findByIdAndOperatorId", async () => {
    const repoError = new GenericError("DB connection failed");
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi.fn().mockResolvedValue(err(repoError)),
      },
    });
    const useCase = makePublishOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
    expect(
      deps.opportunityRepository.updateStatusByIdAndOperatorId,
    ).not.toHaveBeenCalled();
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("should propagate error from updateStatusByIdAndOperatorId", async () => {
    const repoError = new GenericError("DB update failed");
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_passed"))),
        updateStatusByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(err(repoError)),
      },
    });
    const useCase = makePublishOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("should propagate error from materializedViewRepository.refreshAll", async () => {
    const refreshError = new GenericError(
      "Failed to refresh materialized views",
    );
    const deps = makeDeps({
      materializedViewRepository: {
        refreshAll: vi.fn().mockResolvedValue(err(refreshError)),
      },
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_passed"))),
        updateStatusByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makePublishOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(err(refreshError));
  });
});

describe("makePublishOpportunityUseCase - input validation", () => {
  it("should return ValidationError when operatorId is invalid", async () => {
    const deps = makeDeps();
    const useCase = makePublishOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

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
    const useCase = makePublishOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

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
});
