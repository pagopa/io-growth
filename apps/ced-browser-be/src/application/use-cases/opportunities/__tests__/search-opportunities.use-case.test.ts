import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { makeSearchOpportunitiesUseCase } from "../search-opportunities.use-case.js";
import {
  createMockOpportunityRepository,
  mockSearchOpportunitiesResult,
} from "./mocks.js";

describe("makeSearchOpportunitiesUseCase", () => {
  it("should return the paginated search result from the repository", async () => {
    const opportunityRepository = createMockOpportunityRepository({
      searchFromMaterializedView: vi
        .fn()
        .mockResolvedValue(ok(mockSearchOpportunitiesResult)),
    });
    const useCase = makeSearchOpportunitiesUseCase(opportunityRepository);

    const result = await useCase({
      language: "en",
      limit: 10,
      offset: 5,
      orderBy: "name",
      orderDirection: "asc",
    });

    expect(result).toEqual(ok(mockSearchOpportunitiesResult));
    expect(
      opportunityRepository.searchFromMaterializedView,
    ).toHaveBeenCalledWith({
      language: "en",
      limit: 10,
      offset: 5,
      orderBy: "name",
      orderDirection: "asc",
    });
  });

  it("should apply default pagination and ordering when input is empty", async () => {
    const opportunityRepository = createMockOpportunityRepository({
      searchFromMaterializedView: vi
        .fn()
        .mockResolvedValue(ok(mockSearchOpportunitiesResult)),
    });
    const useCase = makeSearchOpportunitiesUseCase(opportunityRepository);

    await useCase({});

    expect(
      opportunityRepository.searchFromMaterializedView,
    ).toHaveBeenCalledWith({
      language: "it",
      limit: 20,
      offset: 0,
      orderBy: "dateFrom",
      orderDirection: "desc",
    });
  });

  it("should propagate repository errors", async () => {
    const repoError = new GenericError("DB connection failed");
    const opportunityRepository = createMockOpportunityRepository({
      searchFromMaterializedView: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeSearchOpportunitiesUseCase(opportunityRepository);

    const result = await useCase({});

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when limit exceeds the maximum", async () => {
    const opportunityRepository = createMockOpportunityRepository();
    const useCase = makeSearchOpportunitiesUseCase(opportunityRepository);

    const result = await useCase({ limit: 100 });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      opportunityRepository.searchFromMaterializedView,
    ).not.toHaveBeenCalled();
  });

  it("should return ValidationError when orderBy is not supported", async () => {
    const opportunityRepository = createMockOpportunityRepository();
    const useCase = makeSearchOpportunitiesUseCase(opportunityRepository);

    const result = await useCase({
      orderBy: "unsupported" as never,
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      opportunityRepository.searchFromMaterializedView,
    ).not.toHaveBeenCalled();
  });

  it("should return ValidationError when language is not supported", async () => {
    const opportunityRepository = createMockOpportunityRepository();
    const useCase = makeSearchOpportunitiesUseCase(opportunityRepository);

    const result = await useCase({
      language: "xx" as never,
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      opportunityRepository.searchFromMaterializedView,
    ).not.toHaveBeenCalled();
  });
});
