import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";

import { makeOperatorCancelScheduledSuspensionUseCase } from "../operator-cancel-scheduled-suspension.use-case.js";
import { createMockOpportunityRepository, MOCK_OPERATOR_ID } from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const mockOpportunity = (
  suspendFrom: null | string,
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
  operatorId: MOCK_OPERATOR_ID,
  opportunityId: MOCK_OPPORTUNITY_ID,
};

describe("makeOperatorCancelScheduledSuspensionUseCase - happy path", () => {
  it("should cancel a pending scheduled suspension", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        cancelScheduledSuspensionByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(undefined)),
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("2026-08-01"))),
      },
    });
    const useCase = makeOperatorCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.cancelScheduledSuspensionByIdAndOperatorId,
    ).toHaveBeenCalledWith({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
    });
  });
});

describe("makeOperatorCancelScheduledSuspensionUseCase - guard", () => {
  it("should return NotFoundError when the opportunity does not exist", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeOperatorCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(
      deps.opportunityRepository.cancelScheduledSuspensionByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should return PreconditionFailedError when no scheduled suspension is pending", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity(null))),
      },
    });
    const useCase = makeOperatorCancelScheduledSuspensionUseCase(
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
      deps.opportunityRepository.cancelScheduledSuspensionByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should return PreconditionFailedError when the suspension was scheduled by the department", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("2026-08-01", "department"))),
      },
    });
    const useCase = makeOperatorCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: Only the department can cancel a department-scheduled suspension",
        }),
      ),
    );
    expect(
      deps.opportunityRepository.cancelScheduledSuspensionByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });
});

describe("makeOperatorCancelScheduledSuspensionUseCase - error propagation", () => {
  it("should return ConflictError when the cron applied the suspension first", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        cancelScheduledSuspensionByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(
            err(
              new ConflictError("Opportunity status was modified concurrently"),
            ),
          ),
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("2026-08-01"))),
      },
    });
    const useCase = makeOperatorCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

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
    const useCase = makeOperatorCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
    expect(
      deps.opportunityRepository.cancelScheduledSuspensionByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });
});

describe("makeOperatorCancelScheduledSuspensionUseCase - input validation", () => {
  it("should return ValidationError when operatorId is not a ULID", async () => {
    const deps = makeDeps();
    const useCase = makeOperatorCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase({ ...validInput, operatorId: "invalid" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should return ValidationError when opportunityId is not a ULID", async () => {
    const deps = makeDeps();
    const useCase = makeOperatorCancelScheduledSuspensionUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase({
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
