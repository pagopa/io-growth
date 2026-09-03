import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";
import type { MaterializedViewRepository } from "../../../../domain/ports/outbound/materialized-view.repository.js";
import type { OperatorRepository } from "../../../../domain/ports/outbound/persistence/operator.repository.js";
import type { OpportunityCategoryRepository } from "../../../../domain/ports/outbound/persistence/opportunity-category.repository.js";
import type { PlaceRepository } from "../../../../domain/ports/outbound/persistence/place.repository.js";

import { makeOperatorUpdateOpportunityUseCase } from "../operator-update-opportunity.use-case.js";
import {
  createMockMaterializedViewRepository,
  createMockOpportunityRepository,
  MOCK_OPERATOR_ID,
  MOCK_PLACE_ID,
} from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";
const CATEGORY_ID = "01KRJXEYD44B58700GT982CCYY";
const EXPECTED_UPDATED_AT = "2026-01-01T00:00:00.000Z";

const createMockOperatorRepository = (
  overrides?: Partial<OperatorRepository>,
): OperatorRepository => ({
  create: vi.fn(),
  getByExternalId: vi.fn(),
  getById: vi.fn().mockResolvedValue(
    ok({
      externalId: "ext",
      id: MOCK_OPERATOR_ID,
      name: "Op",
      status: "active",
    }),
  ),
  ...overrides,
});

const createMockOpportunityCategoryRepository = (
  overrides?: Partial<OpportunityCategoryRepository>,
): OpportunityCategoryRepository => ({
  getById: vi
    .fn()
    .mockResolvedValue(
      ok({ description: "desc", id: CATEGORY_ID, title: "title" }),
    ),
  list: vi.fn(),
  ...overrides,
});

const createMockPlaceRepository = (
  overrides?: Partial<PlaceRepository>,
): PlaceRepository => ({
  create: vi.fn(),
  getById: vi.fn(),
  getIdsByOperator: vi.fn().mockResolvedValue(ok([MOCK_PLACE_ID])),
  listByOperatorId: vi.fn(),
  ...overrides,
});

const mockOpportunity = (
  overrides: Partial<OpportunityDetail> = {},
): OpportunityDetail => ({
  beneficiaryBenefit: {
    discountType: "percentage",
    type: "discount",
    value: 20,
  },
  caregiverBenefit: { type: "free" },
  categoryId: CATEGORY_ID,
  categoryTitle: "Cultura",
  createdAt: "2026-01-01T00:00:00.000Z",
  dateFrom: "2026-01-01",
  dateTo: "2026-12-31",
  id: MOCK_OPPORTUNITY_ID,
  localizedMetadata: [{ key: "name", language: "it", value: "Sconto 20%" }],
  nationalTerritory: false,
  placeIds: [MOCK_PLACE_ID],
  status: "published",
  suspendFrom: null,
  updatedAt: EXPECTED_UPDATED_AT,
  url: "https://example.org/promo",
  ...overrides,
});

const makeDeps = (overrides?: {
  materializedViewRepository?: Partial<MaterializedViewRepository>;
  operatorRepository?: Partial<OperatorRepository>;
  opportunityCategoryRepository?: Partial<OpportunityCategoryRepository>;
  opportunityRepository?: Partial<
    Parameters<typeof createMockOpportunityRepository>[0]
  >;
  placeRepository?: Partial<PlaceRepository>;
}) => ({
  materializedViewRepository: createMockMaterializedViewRepository(
    overrides?.materializedViewRepository,
  ),
  operatorRepository: createMockOperatorRepository(
    overrides?.operatorRepository,
  ),
  opportunityCategoryRepository: createMockOpportunityCategoryRepository(
    overrides?.opportunityCategoryRepository,
  ),
  opportunityRepository: createMockOpportunityRepository({
    findByIdAndOperatorId: vi.fn().mockResolvedValue(ok(mockOpportunity())),
    updateFieldsByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    ...overrides?.opportunityRepository,
  }),
  placeRepository: createMockPlaceRepository(overrides?.placeRepository),
});

const baseInput = {
  expectedUpdatedAt: EXPECTED_UPDATED_AT,
  operatorId: MOCK_OPERATOR_ID,
  opportunityId: MOCK_OPPORTUNITY_ID,
};

// A benefit that differs from the mock's current one (value 20 -> 10).
const changedBenefit = {
  discountType: "percentage" as const,
  type: "discount" as const,
  value: 10,
};
// Same shape/value as the mock's current benefit (no real change).
const sameBenefit = {
  discountType: "percentage" as const,
  type: "discount" as const,
  value: 20,
};

const findReturning = (opp: OpportunityDetail | undefined) => ({
  findByIdAndOperatorId: vi.fn().mockResolvedValue(ok(opp)),
});

describe("makeOperatorUpdateOpportunityUseCase - binding / transition", () => {
  it.each(["draft", "test_rejected", "test_passed"] as const)(
    "does not transition on a benefit change in the free state %s",
    async (status) => {
      const deps = makeDeps({
        opportunityRepository: findReturning(mockOpportunity({ status })),
      });
      const result = await makeOperatorUpdateOpportunityUseCase(deps)({
        ...baseInput,
        beneficiaryBenefit: changedBenefit,
      });

      expect(result).toEqual(ok(undefined));
      expect(
        deps.opportunityRepository.updateFieldsByIdAndOperatorId,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ transitionToTestPending: false }),
      );
      expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
    },
  );

  it.each(["published", "scheduled", "suspended"] as const)(
    "transitions to test_pending on a real benefit change in the dichotomy state %s",
    async (status) => {
      const deps = makeDeps({
        opportunityRepository: findReturning(mockOpportunity({ status })),
      });
      const result = await makeOperatorUpdateOpportunityUseCase(deps)({
        ...baseInput,
        beneficiaryBenefit: changedBenefit,
      });

      expect(result).toEqual(ok(undefined));
      expect(
        deps.opportunityRepository.updateFieldsByIdAndOperatorId,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ transitionToTestPending: true }),
      );
    },
  );

  it("does not transition when the benefit is re-sent identical (no real change)", async () => {
    const deps = makeDeps({
      opportunityRepository: findReturning(
        mockOpportunity({ status: "published" }),
      ),
    });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      beneficiaryBenefit: sameBenefit,
    });

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.updateFieldsByIdAndOperatorId,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ transitionToTestPending: false }),
    );
  });

  it("does not transition on a non-binding (url) change on a published opportunity", async () => {
    const deps = makeDeps({
      opportunityRepository: findReturning(
        mockOpportunity({ status: "published" }),
      ),
    });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      url: "https://example.org/new",
    });

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.updateFieldsByIdAndOperatorId,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ transitionToTestPending: false }),
    );
  });

  it("treats caregiver removal (null) as binding", async () => {
    const deps = makeDeps({
      opportunityRepository: findReturning(
        mockOpportunity({ status: "published" }),
      ),
    });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      caregiverBenefit: null,
    });

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.updateFieldsByIdAndOperatorId,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ transitionToTestPending: true }),
    );
  });

  it("treats caregiver addition (was null) as binding", async () => {
    const deps = makeDeps({
      opportunityRepository: findReturning(
        mockOpportunity({ caregiverBenefit: null, status: "published" }),
      ),
    });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      caregiverBenefit: { type: "free" },
    });

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.updateFieldsByIdAndOperatorId,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ transitionToTestPending: true }),
    );
  });
});

describe("makeOperatorUpdateOpportunityUseCase - MV refresh", () => {
  it("refreshes the MV when the opportunity was published (live)", async () => {
    const deps = makeDeps({
      opportunityRepository: findReturning(
        mockOpportunity({ status: "published" }),
      ),
    });
    await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      url: "https://example.org/new",
    });

    expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledOnce();
  });

  it("refreshes the MV when a scheduled opportunity's dateFrom is moved to a currently active date", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const deps = makeDeps({
      opportunityRepository: findReturning(
        mockOpportunity({ dateFrom: "2099-12-31", status: "scheduled" }),
      ),
    });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      dateFrom: today,
    });

    expect(result).toEqual(ok(undefined));
    expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledOnce();
  });

  it("does not refresh the MV for a scheduled opportunity whose dateFrom stays in the future", async () => {
    const deps = makeDeps({
      opportunityRepository: findReturning(
        mockOpportunity({ dateFrom: "2099-12-31", status: "scheduled" }),
      ),
    });
    await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      dateFrom: "2099-12-31",
    });

    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("does not refresh the MV for a suspended opportunity", async () => {
    const deps = makeDeps({
      opportunityRepository: findReturning(
        mockOpportunity({ status: "suspended" }),
      ),
    });
    await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      dateFrom: "2026-02-01",
    });

    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("still succeeds when refreshAll fails (best-effort)", async () => {
    const deps = makeDeps({
      materializedViewRepository: {
        refreshAll: vi
          .fn()
          .mockResolvedValue(err(new GenericError("refresh failed"))),
      },
      opportunityRepository: findReturning(
        mockOpportunity({ status: "published" }),
      ),
    });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      url: "https://example.org/new",
    });

    expect(result).toEqual(ok(undefined));
  });
});

describe("makeOperatorUpdateOpportunityUseCase - published dateTo", () => {
  it("returns 400 when a published opportunity is given a dateTo of today or earlier", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const deps = makeDeps({
      opportunityRepository: findReturning(
        mockOpportunity({ status: "published" }),
      ),
    });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      dateTo: today,
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.updateFieldsByIdAndOperatorId,
    ).not.toHaveBeenCalled();
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("accepts a published opportunity dateTo of tomorrow", async () => {
    const tomorrowDate = new Date();
    tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
    const tomorrow = tomorrowDate.toISOString().slice(0, 10);
    const deps = makeDeps({
      opportunityRepository: findReturning(
        mockOpportunity({ status: "published" }),
      ),
    });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      dateTo: tomorrow,
    });

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.updateFieldsByIdAndOperatorId,
    ).toHaveBeenCalledWith(expect.objectContaining({ dateTo: tomorrow }));
  });

  it("allows clearing dateTo on a published opportunity", async () => {
    const deps = makeDeps({
      opportunityRepository: findReturning(
        mockOpportunity({ status: "published" }),
      ),
    });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      dateTo: null,
    });

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.updateFieldsByIdAndOperatorId,
    ).toHaveBeenCalledWith(expect.objectContaining({ dateTo: null }));
  });
});

describe("makeOperatorUpdateOpportunityUseCase - blocked states", () => {
  it("returns 404 when the opportunity is not found (also covers deleted/not-owned)", async () => {
    const deps = makeDeps({ opportunityRepository: findReturning(undefined) });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      url: "https://example.org/new",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(
      deps.opportunityRepository.updateFieldsByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it.each(["test_pending", "scheduled_suspension"] as const)(
    "returns 412 when the status is %s",
    async (status) => {
      const deps = makeDeps({
        opportunityRepository: findReturning(mockOpportunity({ status })),
      });
      const result = await makeOperatorUpdateOpportunityUseCase(deps)({
        ...baseInput,
        url: "https://example.org/new",
      });

      expect(result).toEqual(
        err(expect.objectContaining({ kind: "PreconditionFailedError" })),
      );
      expect(
        deps.opportunityRepository.updateFieldsByIdAndOperatorId,
      ).not.toHaveBeenCalled();
    },
  );
});

describe("makeOperatorUpdateOpportunityUseCase - CAS / error propagation", () => {
  it("returns 409 when the CAS fails and does not refresh", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity({ status: "published" }))),
        updateFieldsByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(
            err(new ConflictError("Opportunity was modified concurrently")),
          ),
      },
    });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      url: "https://example.org/new",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ConflictError" })),
    );
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("forwards expectedUpdatedAt to the repository", async () => {
    const deps = makeDeps();
    await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      url: "https://example.org/new",
    });

    expect(
      deps.opportunityRepository.updateFieldsByIdAndOperatorId,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ expectedUpdatedAt: EXPECTED_UPDATED_AT }),
    );
  });

  it("propagates an error from findByIdAndOperatorId", async () => {
    const repoError = new GenericError("DB down");
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi.fn().mockResolvedValue(err(repoError)),
      },
    });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      url: "https://example.org/new",
    });

    expect(result).toEqual(err(repoError));
  });
});

describe("makeOperatorUpdateOpportunityUseCase - existence validation", () => {
  it("returns ValidationError when the new category does not exist", async () => {
    const deps = makeDeps({
      opportunityCategoryRepository: {
        getById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      categoryId: "01KRJXEYD44B58700GT982CCZZ",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.updateFieldsByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("skips existence validation when neither categoryId nor placeIds is touched", async () => {
    const deps = makeDeps();
    await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      url: "https://example.org/new",
    });

    expect(deps.opportunityCategoryRepository.getById).not.toHaveBeenCalled();
    expect(deps.placeRepository.getIdsByOperator).not.toHaveBeenCalled();
    expect(
      deps.opportunityRepository.updateFieldsByIdAndOperatorId,
    ).toHaveBeenCalledOnce();
  });
});

describe("makeOperatorUpdateOpportunityUseCase - input validation", () => {
  it("returns ValidationError on an empty payload (no editable field)", async () => {
    const deps = makeDeps();
    const result = await makeOperatorUpdateOpportunityUseCase(deps)(baseInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("returns ValidationError when expectedUpdatedAt is not an ISO datetime", async () => {
    const deps = makeDeps();
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      expectedUpdatedAt: "2026-01-01",
      url: "https://example.org/new",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("returns ValidationError when operatorId is not a ULID", async () => {
    const deps = makeDeps();
    const result = await makeOperatorUpdateOpportunityUseCase(deps)({
      ...baseInput,
      operatorId: "invalid",
      url: "https://example.org/new",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
  });
});
