import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";
import type { MaterializedViewRepository } from "../../../../domain/ports/outbound/materialized-view.repository.js";

import { makeApproveOpportunityUseCase } from "../approve-opportunity.use-case.js";
import {
  createMockMaterializedViewRepository,
  createMockOpportunityRepository,
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
  nationalTerritory: false,
  operatorName: "Comune di Roma",
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
  opportunityId: MOCK_OPPORTUNITY_ID,
};

// eslint-disable-next-line max-lines-per-function
describe("makeApproveOpportunityUseCase", () => {
  it("should approve an opportunity in test_pending status", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_pending"))),
        updateStatusById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeApproveOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.opportunityRepository.updateStatusById).toHaveBeenCalledWith({
      dateFrom: undefined,
      expectedStatuses: ["test_pending", "test_rejected"],
      opportunityId: MOCK_OPPORTUNITY_ID,
      status: "published",
    });
  });

  it("should approve an opportunity in test_rejected status", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_rejected"))),
        updateStatusById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeApproveOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.opportunityRepository.updateStatusById).toHaveBeenCalledWith(
      expect.objectContaining({ status: "published" }),
    );
  });

  it("should pass dateFrom to updateStatusById when provided", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_pending"))),
        updateStatusById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeApproveOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    await useCase({ ...validInput, dateFrom: "2026-09-01" });

    expect(deps.opportunityRepository.updateStatusById).toHaveBeenCalledWith(
      expect.objectContaining({ dateFrom: "2026-09-01" }),
    );
  });

  it("should refresh materialized views when dateFrom is in the past", async () => {
    const deps = makeDeps({
      materializedViewRepository: {
        refreshAll: vi.fn().mockResolvedValue(ok(undefined)),
      },
      opportunityRepository: {
        findById: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_pending", "2026-01-01"))),
        updateStatusById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeApproveOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledOnce();
  });

  it("should not refresh materialized views when dateFrom is in the future", async () => {
    const deps = makeDeps({
      materializedViewRepository: { refreshAll: vi.fn() },
      opportunityRepository: {
        findById: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_pending", "2099-12-31"))),
        updateStatusById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeApproveOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("should approve even if materialized view refresh fails", async () => {
    const deps = makeDeps({
      materializedViewRepository: {
        refreshAll: vi
          .fn()
          .mockResolvedValue(err(new GenericError("refresh failed"))),
      },
      opportunityRepository: {
        findById: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_pending", "2026-01-01"))),
        updateStatusById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeApproveOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledOnce();
  });

  it("should return NotFoundError when opportunity does not exist", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeApproveOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(deps.opportunityRepository.updateStatusById).not.toHaveBeenCalled();
  });

  it.each([
    "draft",
    "test_passed",
    "published",
    "suspended",
    "deleted",
  ] as const)(
    "should return PreconditionFailedError when status is %s",
    async (status) => {
      const deps = makeDeps({
        opportunityRepository: {
          findById: vi.fn().mockResolvedValue(ok(mockOpportunity(status))),
        },
      });
      const useCase = makeApproveOpportunityUseCase(
        deps.opportunityRepository,
        deps.materializedViewRepository,
      );

      const result = await useCase(validInput);

      expect(result).toEqual(
        err(expect.objectContaining({ kind: "PreconditionFailedError" })),
      );
      expect(
        deps.opportunityRepository.updateStatusById,
      ).not.toHaveBeenCalled();
    },
  );

  it("should return ConflictError on concurrent modification", async () => {
    const conflictError = new ConflictError("Concurrent modification");
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_pending"))),
        updateStatusById: vi.fn().mockResolvedValue(err(conflictError)),
      },
    });
    const useCase = makeApproveOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(err(conflictError));
  });

  it("should propagate repository errors from findById fetch", async () => {
    const repoError = new GenericError("DB connection failed");
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi.fn().mockResolvedValue(err(repoError)),
      },
    });
    const useCase = makeApproveOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
    expect(deps.opportunityRepository.updateStatusById).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from updateStatusById", async () => {
    const repoError = new GenericError("DB update failed");
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("test_pending"))),
        updateStatusById: vi.fn().mockResolvedValue(err(repoError)),
      },
    });
    const useCase = makeApproveOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when opportunityId is invalid", async () => {
    const deps = makeDeps();
    const useCase = makeApproveOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
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

  it("should return ValidationError when dateFrom is not a valid date", async () => {
    const deps = makeDeps();
    const useCase = makeApproveOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase({ ...validInput, dateFrom: "not-a-date" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.findById).not.toHaveBeenCalled();
  });
});
