import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { PaginatedPlaces } from "../../../../domain/ports/outbound/persistence/place.repository.js";

import { makeOperatorListPlacesUseCase } from "../operator-list-places.use-case.js";
import {
  createMockPlaceRepository,
  MOCK_OPERATOR_ID,
  mockPlaces,
} from "./mocks.js";

const mockPaginatedPlaces: PaginatedPlaces = {
  items: mockPlaces.map((place) => ({
    ...place,
    associatedOpportunities: 2,
  })),
  total: 1,
};

describe("makeOperatorListPlacesUseCase", () => {
  it("should return paginated operator places and apply pagination defaults", async () => {
    const placeRepository = createMockPlaceRepository({
      listByOperatorId: vi.fn().mockResolvedValue(ok(mockPaginatedPlaces)),
    });
    const useCase = makeOperatorListPlacesUseCase(placeRepository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
    });

    expect(result).toEqual(ok(mockPaginatedPlaces));
    expect(placeRepository.listByOperatorId).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      operatorId: MOCK_OPERATOR_ID,
    });
  });

  it.each(["online", "offline"] as const)(
    "should forward pagination, name search and the %s filter",
    async (type) => {
      const placeRepository = createMockPlaceRepository({
        listByOperatorId: vi.fn().mockResolvedValue(ok(mockPaginatedPlaces)),
      });
      const useCase = makeOperatorListPlacesUseCase(placeRepository);
      const input = {
        limit: 100,
        offset: 30,
        operatorId: MOCK_OPERATOR_ID,
        search: "Sportello",
        type,
      };

      await expect(useCase(input)).resolves.toEqual(ok(mockPaginatedPlaces));
      expect(placeRepository.listByOperatorId).toHaveBeenCalledWith(input);
    },
  );

  it("should retain the matching total for an empty page", async () => {
    const emptyPage: PaginatedPlaces = { items: [], total: 3 };
    const placeRepository = createMockPlaceRepository({
      listByOperatorId: vi.fn().mockResolvedValue(ok(emptyPage)),
    });
    const useCase = makeOperatorListPlacesUseCase(placeRepository);

    await expect(
      useCase({ offset: 100, operatorId: MOCK_OPERATOR_ID }),
    ).resolves.toEqual(ok(emptyPage));
  });

  it("should propagate repository errors", async () => {
    const repoError = new GenericError("DB connection failed");
    const placeRepository = createMockPlaceRepository({
      listByOperatorId: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeOperatorListPlacesUseCase(placeRepository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
    });

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when operatorId is empty", async () => {
    const placeRepository = createMockPlaceRepository();
    const useCase = makeOperatorListPlacesUseCase(placeRepository);

    const result = await useCase({ operatorId: "" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(placeRepository.listByOperatorId).not.toHaveBeenCalled();
  });

  it.each([
    { limit: 0 },
    { limit: 101 },
    { limit: 1.5 },
    { limit: Infinity },
    { offset: -1 },
    { offset: 0.5 },
    { offset: NaN },
  ])("should reject invalid pagination %j", async (pagination) => {
    const placeRepository = createMockPlaceRepository();
    const useCase = makeOperatorListPlacesUseCase(placeRepository);

    const result = await useCase({
      ...pagination,
      operatorId: MOCK_OPERATOR_ID,
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(placeRepository.listByOperatorId).not.toHaveBeenCalled();
  });
});
