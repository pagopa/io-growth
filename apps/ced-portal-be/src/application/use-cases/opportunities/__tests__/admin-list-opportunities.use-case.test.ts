import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { PaginatedOpportunities } from "../../../../domain/ports/outbound/persistence/opportunity.repository.js";

import { makeAdminListOpportunitiesUseCase } from "../admin-list-opportunities.use-case.js";
import { createMockOpportunityRepository } from "./mocks.js";

const mockPaginatedResult: PaginatedOpportunities = {
  items: [
    {
      categoryTitle: "Cultura e tempo libero",
      dateFrom: "2026-01-01",
      dateTo: "2026-12-31",
      id: "01JVMK3N8XQZP5T6G2WYHAB4CF",
      name: "Discount 20%",
      operatorName: "Ente Demo",
      status: "draft",
    },
  ],
  total: 1,
};

const validInput = {
  limit: 20,
  offset: 0,
  sortBy: "createdAt" as const,
  sortOrder: "desc" as const,
  userType: "admin" as const,
};

describe("makeAdminListOpportunitiesUseCase", () => {
  it("should return paginated opportunities for admin role", async () => {
    const repository = createMockOpportunityRepository({
      findAll: vi.fn().mockResolvedValue(ok(mockPaginatedResult)),
    });
    const useCase = makeAdminListOpportunitiesUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(ok(mockPaginatedResult));
  });

  it("should pass optional filters to repository", async () => {
    const repository = createMockOpportunityRepository({
      findAll: vi.fn().mockResolvedValue(ok({ items: [], total: 0 })),
    });
    const useCase = makeAdminListOpportunitiesUseCase(repository);

    const inputWithFilters = {
      ...validInput,
      categoryId: "01KRJXEYD44B58700GT982CCYY",
      operatorId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
      search: "sconto",
      status: "published" as const,
    };

    await useCase(inputWithFilters);

    expect(repository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: inputWithFilters.categoryId,
        operatorId: inputWithFilters.operatorId,
        search: inputWithFilters.search,
        status: inputWithFilters.status,
      }),
    );
  });

  it("should propagate repository errors", async () => {
    const repoError = new GenericError("DB connection failed");
    const repository = createMockOpportunityRepository({
      findAll: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeAdminListOpportunitiesUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when operatorId is not a valid ULID", async () => {
    const repository = createMockOpportunityRepository();
    const useCase = makeAdminListOpportunitiesUseCase(repository);

    const result = await useCase({ ...validInput, operatorId: "invalid-id" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(repository.findAll).not.toHaveBeenCalled();
  });

  it("should forward default pagination and sorting values to repository", async () => {
    const repository = createMockOpportunityRepository({
      findAll: vi.fn().mockResolvedValue(ok({ items: [], total: 0 })),
    });
    const useCase = makeAdminListOpportunitiesUseCase(repository);

    await useCase(validInput);

    expect(repository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 20,
        offset: 0,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    );
  });
});
