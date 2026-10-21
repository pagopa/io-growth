import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";

import { makeAdminRepublishOpportunityUseCase } from "../admin-republish-opportunity.use-case.js";
import {
  createMockMaterializedViewRepository,
  createMockOpportunityRepository,
  MOCK_OPERATOR_ID,
} from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const mockOpportunity = (
  status: OpportunityDetail["status"] = "suspended",
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
  dateTo: "2099-12-31",
  id: MOCK_OPPORTUNITY_ID,
  localizedMetadata: [{ key: "name", language: "it", value: "Discount 20%" }],
  nationalTerritory: false,
  operatorId: MOCK_OPERATOR_ID,
  placeIds: ["01JVMK3N8XQZP5T6G2WYHAB4CD"],
  status,
  suspendedBy: "department",
  suspendFrom: null,
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
});

const makeDeps = (overrides?: {
  found?: OpportunityDetail | undefined;
  refreshFails?: boolean;
  republishFails?: boolean;
}) => ({
  materializedViewRepository: createMockMaterializedViewRepository({
    refreshAll: vi
      .fn()
      .mockResolvedValue(
        overrides?.refreshFails ? err(new GenericError("boom")) : ok(undefined),
      ),
  }),
  opportunityRepository: createMockOpportunityRepository({
    findById: vi
      .fn()
      .mockResolvedValue(
        ok("found" in (overrides ?? {}) ? overrides?.found : mockOpportunity()),
      ),
    republishById: vi
      .fn()
      .mockResolvedValue(
        overrides?.republishFails
          ? err(new GenericError("db down"))
          : ok(undefined),
      ),
  }),
});

const makeUseCase = (deps: ReturnType<typeof makeDeps>) =>
  makeAdminRepublishOpportunityUseCase(
    deps.opportunityRepository,
    deps.materializedViewRepository,
  );

const validInput = { opportunityId: MOCK_OPPORTUNITY_ID };

describe("makeAdminRepublishOpportunityUseCase", () => {
  it("should republish a suspended opportunity and refresh the materialized views", async () => {
    const deps = makeDeps();

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.opportunityRepository.republishById).toHaveBeenCalledWith(
      validInput,
    );
    expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledWith();
  });

  it("should republish an opportunity suspended by the operator too", async () => {
    const deps = makeDeps();

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(ok(undefined));
  });

  it("should return NotFoundError when the opportunity does not exist", async () => {
    const deps = makeDeps({ found: undefined });

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(deps.opportunityRepository.republishById).not.toHaveBeenCalled();
  });

  it.each(["published", "draft", "test_pending", "deleted"] as const)(
    "should return PreconditionFailedError when the opportunity is %s",
    async (status) => {
      const deps = makeDeps({ found: mockOpportunity(status) });

      const result = await makeUseCase(deps)(validInput);

      expect(result).toEqual(
        err(expect.objectContaining({ kind: "PreconditionFailedError" })),
      );
      expect(deps.opportunityRepository.republishById).not.toHaveBeenCalled();
    },
  );

  it("should succeed even when refreshing the materialized views fails", async () => {
    const deps = makeDeps({ refreshFails: true });

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(ok(undefined));
  });

  it("should propagate a repository failure", async () => {
    const deps = makeDeps({ republishFails: true });

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(err(expect.any(GenericError)));
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("should return ValidationError when the opportunityId is not a ULID", async () => {
    const deps = makeDeps();

    const result = await makeUseCase(deps)({ opportunityId: "not-a-ulid" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.findById).not.toHaveBeenCalled();
  });
});
