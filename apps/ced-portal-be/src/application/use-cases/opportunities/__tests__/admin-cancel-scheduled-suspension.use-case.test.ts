import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";

import { makeAdminCancelScheduledSuspensionUseCase } from "../admin-cancel-scheduled-suspension.use-case.js";
import { createMockOpportunityRepository } from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const mockOpportunity = (
  suspendFrom: null | string,
  suspendedByType: "department" | "operator" | null = suspendFrom
    ? "department"
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
  status: "published",
  suspendedByType,
  suspendFrom,
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
  opportunityId: MOCK_OPPORTUNITY_ID,
};

describe("makeAdminCancelScheduledSuspensionUseCase - happy path", () => {
  it("should cancel a pending department-scheduled suspension", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        cancelScheduledSuspensionById: vi.fn().mockResolvedValue(ok(undefined)),
        findById: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("2026-08-01", "department"))),
      },
    });
    const useCase = makeAdminCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.cancelScheduledSuspensionById,
    ).toHaveBeenCalledWith({
      opportunityId: MOCK_OPPORTUNITY_ID,
    });
  });

  it("should cancel a pending operator-scheduled suspension (absolute cancel)", async () => {
    // The department cancel has no restriction on who scheduled it.
    const deps = makeDeps({
      opportunityRepository: {
        cancelScheduledSuspensionById: vi.fn().mockResolvedValue(ok(undefined)),
        findById: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("2026-08-01", "operator"))),
      },
    });
    const useCase = makeAdminCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.cancelScheduledSuspensionById,
    ).toHaveBeenCalledWith({
      opportunityId: MOCK_OPPORTUNITY_ID,
    });
  });
});

describe("makeAdminCancelScheduledSuspensionUseCase - guard", () => {
  it("should return NotFoundError when the opportunity does not exist", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeAdminCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(
      deps.opportunityRepository.cancelScheduledSuspensionById,
    ).not.toHaveBeenCalled();
  });

  it("should return PreconditionFailedError when no scheduled suspension is pending", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findById: vi.fn().mockResolvedValue(ok(mockOpportunity(null))),
      },
    });
    const useCase = makeAdminCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: No scheduled suspension is pending for this opportunity",
        }),
      ),
    );
    expect(
      deps.opportunityRepository.cancelScheduledSuspensionById,
    ).not.toHaveBeenCalled();
  });
});

describe("makeAdminCancelScheduledSuspensionUseCase - error propagation", () => {
  it("should return ConflictError when the cron applied the suspension first", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        cancelScheduledSuspensionById: vi
          .fn()
          .mockResolvedValue(
            err(
              new ConflictError("Opportunity status was modified concurrently"),
            ),
          ),
        findById: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("2026-08-01", "department"))),
      },
    });
    const useCase = makeAdminCancelScheduledSuspensionUseCase(
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
      opportunityRepository: {
        findById: vi.fn().mockResolvedValue(err(repoError)),
      },
    });
    const useCase = makeAdminCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
    expect(
      deps.opportunityRepository.cancelScheduledSuspensionById,
    ).not.toHaveBeenCalled();
  });
});

describe("makeAdminCancelScheduledSuspensionUseCase - input validation", () => {
  it("should return ValidationError when opportunityId is not a ULID", async () => {
    const deps = makeDeps();
    const useCase = makeAdminCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase({ opportunityId: "not-a-ulid" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.findById).not.toHaveBeenCalled();
  });
});
