import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";

import { makeAdminGetOpportunityUseCase } from "../admin-get-opportunity.use-case.js";
import { createMockOpportunityRepository } from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const mockOpportunityDetail: OpportunityDetail = {
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
  localizedMetadata: [
    { key: "name", language: "it", value: "Discount 20%" },
    {
      key: "description",
      language: "it",
      value: "20% discount on all services",
    },
  ],
  nationalTerritory: false,
  operatorName: "Comune di Roma",
  placeIds: ["01JVMK3N8XQZP5T6G2WYHAB4CD"],
  status: "test_pending",
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
};

const validInput = {
  opportunityId: MOCK_OPPORTUNITY_ID,
};

describe("makeAdminGetOpportunityUseCase", () => {
  it("should return opportunity detail when found", async () => {
    const repository = createMockOpportunityRepository({
      findById: vi.fn().mockResolvedValue(ok(mockOpportunityDetail)),
    });
    const useCase = makeAdminGetOpportunityUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(ok(mockOpportunityDetail));
    expect(repository.findById).toHaveBeenCalledWith({
      opportunityId: MOCK_OPPORTUNITY_ID,
    });
  });

  it("should return NotFoundError when opportunity does not exist", async () => {
    const repository = createMockOpportunityRepository({
      findById: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeAdminGetOpportunityUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
  });

  it("should propagate repository errors", async () => {
    const repoError = new GenericError("DB connection failed");
    const repository = createMockOpportunityRepository({
      findById: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeAdminGetOpportunityUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when opportunityId is invalid", async () => {
    const repository = createMockOpportunityRepository();
    const useCase = makeAdminGetOpportunityUseCase(repository);

    const result = await useCase({
      ...validInput,
      opportunityId: "not-a-ulid",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(repository.findById).not.toHaveBeenCalled();
  });
});
