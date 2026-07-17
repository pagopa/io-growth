import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";
import type { MaterializedViewRepository } from "../../../../domain/ports/outbound/materialized-view.repository.js";

import { makeAdminSuspendOpportunityUseCase } from "../admin-suspend-opportunity.use-case.js";
import {
  createMockMaterializedViewRepository,
  createMockOpportunityRepository,
} from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const TODAY = "2026-07-15";

const mockOpportunity = (
  status: OpportunityDetail["status"],
  suspendFrom: null | string = null,
  suspendedByType: "department" | "operator" | null = suspendFrom
    ? "operator"
    : null,
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
  suspendedByType,
  suspendFrom,
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
  suspendFrom: TODAY,
  suspensionMessage: "Sospesa per verifica amministrativa",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T10:00:00.000Z`));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("makeAdminSuspendOpportunityUseCase - immediate vs scheduled", () => {
  it.each([TODAY, "2026-07-14", "2020-01-01"])(
    "should suspend immediately when suspendFrom (%s) is today or in the past",
    async (suspendFrom) => {
      const deps = makeDeps({
        materializedViewRepository: {
          refreshAll: vi.fn().mockResolvedValue(ok(undefined)),
        },
        opportunityRepository: {
          findById: vi.fn().mockResolvedValue(ok(mockOpportunity("published"))),
          suspendById: vi.fn().mockResolvedValue(ok(undefined)),
        },
      });
      const useCase = makeAdminSuspendOpportunityUseCase(
        deps.opportunityRepository,
        deps.materializedViewRepository,
      );

      const result = await useCase({ ...validInput, suspendFrom });

      expect(result).toEqual(ok(undefined));
      // The requested date is not persisted for an immediate suspension.
      expect(deps.opportunityRepository.suspendById).toHaveBeenCalledWith({
        opportunityId: MOCK_OPPORTUNITY_ID,
        suspendFrom: undefined,
        suspensionMessage: "Sospesa per verifica amministrativa",
      });
      expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledOnce();
    },
  );

  it("should schedule the suspension when suspendFrom is in the future", async () => {
    const deps = makeDeps({
      materializedViewRepository: { refreshAll: vi.fn() },
      opportunityRepository: {
        findById: vi.fn().mockResolvedValue(ok(mockOpportunity("published"))),
        suspendById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeAdminSuspendOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase({ ...validInput, suspendFrom: "2026-07-16" });

    expect(result).toEqual(ok(undefined));
    expect(deps.opportunityRepository.suspendById).toHaveBeenCalledWith({
      opportunityId: MOCK_OPPORTUNITY_ID,
      suspendFrom: "2026-07-16",
      suspensionMessage: "Sospesa per verifica amministrativa",
    });
    // A scheduled suspension does not change visibility yet.
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("should trim surrounding whitespace from the suspension message", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi.fn().mockResolvedValue(ok(mockOpportunity("published"))),
        suspendById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeAdminSuspendOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    await useCase({ ...validInput, suspensionMessage: "  Verifica  " });

    expect(deps.opportunityRepository.suspendById).toHaveBeenCalledWith(
      expect.objectContaining({ suspensionMessage: "Verifica" }),
    );
  });
});

describe("makeAdminSuspendOpportunityUseCase - override of a pending schedule", () => {
  it("should suspend immediately when an operator-scheduled suspension is pending", async () => {
    // The derived status for a pending schedule is "scheduled_suspension":
    // the department is not blocked, the immediate suspension absorbs it.
    const deps = makeDeps({
      materializedViewRepository: {
        refreshAll: vi.fn().mockResolvedValue(ok(undefined)),
      },
      opportunityRepository: {
        findById: vi
          .fn()
          .mockResolvedValue(
            ok(mockOpportunity("scheduled_suspension", "2026-08-01")),
          ),
        suspendById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeAdminSuspendOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.opportunityRepository.suspendById).toHaveBeenCalledWith({
      opportunityId: MOCK_OPPORTUNITY_ID,
      suspendFrom: undefined,
      suspensionMessage: "Sospesa per verifica amministrativa",
    });
    expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledOnce();
  });

  it("should overwrite a pending operator schedule with a new scheduled date", async () => {
    const deps = makeDeps({
      materializedViewRepository: { refreshAll: vi.fn() },
      opportunityRepository: {
        findById: vi
          .fn()
          .mockResolvedValue(
            ok(mockOpportunity("scheduled_suspension", "2026-08-01")),
          ),
        suspendById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeAdminSuspendOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase({ ...validInput, suspendFrom: "2026-09-01" });

    expect(result).toEqual(ok(undefined));
    expect(deps.opportunityRepository.suspendById).toHaveBeenCalledWith(
      expect.objectContaining({ suspendFrom: "2026-09-01" }),
    );
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });
});

describe("makeAdminSuspendOpportunityUseCase - status guard", () => {
  it("should return NotFoundError when the opportunity does not exist", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeAdminSuspendOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(deps.opportunityRepository.suspendById).not.toHaveBeenCalled();
  });

  it("should return PreconditionFailedError when the opportunity is not yet live (scheduled)", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi.fn().mockResolvedValue(ok(mockOpportunity("scheduled"))),
      },
    });
    const useCase = makeAdminSuspendOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: Opportunity is not yet live and cannot be suspended",
        }),
      ),
    );
    expect(deps.opportunityRepository.suspendById).not.toHaveBeenCalled();
  });

  it.each(["draft", "test_pending", "test_rejected", "suspended"] as const)(
    "should return PreconditionFailedError when status is %s",
    async (status) => {
      const deps = makeDeps({
        opportunityRepository: {
          findById: vi.fn().mockResolvedValue(ok(mockOpportunity(status))),
        },
      });
      const useCase = makeAdminSuspendOpportunityUseCase(
        deps.opportunityRepository,
        deps.materializedViewRepository,
      );

      const result = await useCase(validInput);

      expect(result).toEqual(
        err(
          expect.objectContaining({
            kind: "PreconditionFailedError",
            message:
              "Precondition failed: Opportunity must be in published status to be suspended",
          }),
        ),
      );
      expect(deps.opportunityRepository.suspendById).not.toHaveBeenCalled();
    },
  );
});

describe("makeAdminSuspendOpportunityUseCase - error propagation", () => {
  it("should return ConflictError on concurrent modification", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi.fn().mockResolvedValue(ok(mockOpportunity("published"))),
        suspendById: vi
          .fn()
          .mockResolvedValue(
            err(
              new ConflictError("Opportunity status was modified concurrently"),
            ),
          ),
      },
    });
    const useCase = makeAdminSuspendOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ConflictError" })),
    );
  });

  it("should succeed even when the materialized view refresh fails", async () => {
    const deps = makeDeps({
      materializedViewRepository: {
        refreshAll: vi
          .fn()
          .mockResolvedValue(err(new GenericError("refresh failed"))),
      },
      opportunityRepository: {
        findById: vi.fn().mockResolvedValue(ok(mockOpportunity("published"))),
        suspendById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeAdminSuspendOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
  });

  it("should propagate an error from findById", async () => {
    const repoError = new GenericError("DB connection failed");
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi.fn().mockResolvedValue(err(repoError)),
      },
    });
    const useCase = makeAdminSuspendOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
    expect(deps.opportunityRepository.suspendById).not.toHaveBeenCalled();
  });
});

describe("makeAdminSuspendOpportunityUseCase - input validation", () => {
  it.each(["", "   "])(
    "should return ValidationError when suspensionMessage (%j) is empty or blank",
    async (suspensionMessage) => {
      const deps = makeDeps();
      const useCase = makeAdminSuspendOpportunityUseCase(
        deps.opportunityRepository,
        deps.materializedViewRepository,
      );

      const result = await useCase({ ...validInput, suspensionMessage });

      expect(result).toEqual(
        err(expect.objectContaining({ kind: "ValidationError" })),
      );
      expect(deps.opportunityRepository.findById).not.toHaveBeenCalled();
    },
  );

  it("should return ValidationError when suspensionMessage exceeds 4096 characters", async () => {
    const deps = makeDeps();
    const useCase = makeAdminSuspendOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase({
      ...validInput,
      suspensionMessage: "x".repeat(4097),
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.findById).not.toHaveBeenCalled();
  });

  it.each([undefined, "not-a-date", "2026-13-01"])(
    "should return ValidationError when suspendFrom (%j) is missing or not an ISO date",
    async (suspendFrom) => {
      const deps = makeDeps();
      const useCase = makeAdminSuspendOpportunityUseCase(
        deps.opportunityRepository,
        deps.materializedViewRepository,
      );

      const result = await useCase({
        ...validInput,
        suspendFrom: suspendFrom as string,
      });

      expect(result).toEqual(
        err(expect.objectContaining({ kind: "ValidationError" })),
      );
      expect(deps.opportunityRepository.findById).not.toHaveBeenCalled();
    },
  );

  it("should return ValidationError when opportunityId is not a ULID", async () => {
    const deps = makeDeps();
    const useCase = makeAdminSuspendOpportunityUseCase(
      deps.opportunityRepository,
      deps.materializedViewRepository,
    );

    const result = await useCase({ ...validInput, opportunityId: "invalid" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.findById).not.toHaveBeenCalled();
  });
});
