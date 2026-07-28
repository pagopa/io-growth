import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { PaginatedOpportunities } from "../../../../domain/ports/outbound/persistence/opportunity.repository.js";

import { makeListOperatorOpportunitiesUseCase } from "../list-operator-opportunities.use-case.js";
import { createMockOpportunityRepository, MOCK_OPERATOR_ID } from "./mocks.js";

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
  operatorId: MOCK_OPERATOR_ID,
  sortBy: "createdAt" as const,
  sortOrder: "desc" as const,
};

describe("makeListOperatorOpportunitiesUseCase", () => {
  it("should return paginated opportunities", async () => {
    const repository = createMockOpportunityRepository({
      findAll: vi.fn().mockResolvedValue(ok(mockPaginatedResult)),
    });
    const useCase = makeListOperatorOpportunitiesUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(ok(mockPaginatedResult));
    expect(repository.findAll).toHaveBeenCalledWith({
      ...validInput,
      excludeDeleted: true,
    });
  });

  it("should always exclude deleted opportunities from operator reads", async () => {
    const repository = createMockOpportunityRepository({
      findAll: vi.fn().mockResolvedValue(ok({ items: [], total: 0 })),
    });
    const useCase = makeListOperatorOpportunitiesUseCase(repository);

    await useCase(validInput);

    expect(repository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ excludeDeleted: true }),
    );
  });

  it("should pass optional filters to repository", async () => {
    const repository = createMockOpportunityRepository({
      findAll: vi.fn().mockResolvedValue(ok({ items: [], total: 0 })),
    });
    const useCase = makeListOperatorOpportunitiesUseCase(repository);

    const inputWithFilters = {
      ...validInput,
      search: "sconto",
      status: "test_rejected" as const,
    };

    await useCase(inputWithFilters);

    expect(repository.findAll).toHaveBeenCalledWith({
      ...inputWithFilters,
      excludeDeleted: true,
    });
  });

  it("should forward the scheduled status filter to the repository", async () => {
    const repository = createMockOpportunityRepository({
      findAll: vi.fn().mockResolvedValue(ok({ items: [], total: 0 })),
    });
    const useCase = makeListOperatorOpportunitiesUseCase(repository);

    await useCase({ ...validInput, status: "scheduled" });

    expect(repository.findAll).toHaveBeenCalledWith({
      ...validInput,
      excludeDeleted: true,
      status: "scheduled",
    });
  });

  it("should forward the scheduled_suspension status filter to the repository", async () => {
    const repository = createMockOpportunityRepository({
      findAll: vi.fn().mockResolvedValue(ok({ items: [], total: 0 })),
    });
    const useCase = makeListOperatorOpportunitiesUseCase(repository);

    await useCase({ ...validInput, status: "scheduled_suspension" });

    expect(repository.findAll).toHaveBeenCalledWith({
      ...validInput,
      excludeDeleted: true,
      status: "scheduled_suspension",
    });
  });

  it("should pass categoryId filter to repository", async () => {
    const repository = createMockOpportunityRepository({
      findAll: vi.fn().mockResolvedValue(ok({ items: [], total: 0 })),
    });
    const useCase = makeListOperatorOpportunitiesUseCase(repository);

    const inputWithCategory = {
      ...validInput,
      categoryId: "01KRJXEYD44B58700GT982CCYY",
    };

    await useCase(inputWithCategory);

    expect(repository.findAll).toHaveBeenCalledWith({
      ...inputWithCategory,
      excludeDeleted: true,
    });
  });

  it("should propagate repository errors", async () => {
    const repoError = new GenericError("DB connection failed");
    const repository = createMockOpportunityRepository({
      findAll: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeListOperatorOpportunitiesUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when operatorId is invalid", async () => {
    const repository = createMockOpportunityRepository();
    const useCase = makeListOperatorOpportunitiesUseCase(repository);

    const result = await useCase({ ...validInput, operatorId: "invalid" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(repository.findAll).not.toHaveBeenCalled();
  });

  it("should apply default values for limit, offset, sortBy, sortOrder", async () => {
    const repository = createMockOpportunityRepository({
      findAll: vi.fn().mockResolvedValue(ok({ items: [], total: 0 })),
    });
    const useCase = makeListOperatorOpportunitiesUseCase(repository);

    await useCase({
      limit: 20,
      offset: 0,
      operatorId: MOCK_OPERATOR_ID,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    expect(repository.findAll).toHaveBeenCalledWith({
      excludeDeleted: true,
      limit: 20,
      offset: 0,
      operatorId: MOCK_OPERATOR_ID,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  });
});
