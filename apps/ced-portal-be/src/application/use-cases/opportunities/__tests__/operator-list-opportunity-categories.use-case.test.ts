import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityCategory } from "../../../../domain/entities/opportunity-category.js";
import type { OpportunityCategoryRepository } from "../../../../domain/ports/outbound/persistence/opportunity-category.repository.js";

import { makeOperatorListOpportunityCategoriesUseCase } from "../operator-list-opportunity-categories.use-case.js";

const mockCategories: OpportunityCategory[] = [
  { id: "01KRJXEYD44B58700GT982CCYY", label: "culture_sport" },
  { id: "01KRJXEYD64E7NX00R5VT185AT", label: "education_employment" },
];

const createMockOpportunityCategoryRepository = (
  overrides?: Partial<OpportunityCategoryRepository>,
): OpportunityCategoryRepository => ({
  getById: vi.fn(),
  list: vi.fn(),
  ...overrides,
});

describe("makeOperatorListOpportunityCategoriesUseCase", () => {
  it("should return all categories", async () => {
    const repository = createMockOpportunityCategoryRepository({
      list: vi.fn().mockResolvedValue(ok(mockCategories)),
    });
    const useCase = makeOperatorListOpportunityCategoriesUseCase(repository);

    const result = await useCase({});

    expect(result).toEqual(ok(mockCategories));
    expect(repository.list).toHaveBeenCalledOnce();
  });

  it("should propagate repository errors", async () => {
    const repoError = new GenericError("DB connection failed");
    const repository = createMockOpportunityCategoryRepository({
      list: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeOperatorListOpportunityCategoriesUseCase(repository);

    const result = await useCase({});

    expect(result).toEqual(err(repoError));
  });
});
