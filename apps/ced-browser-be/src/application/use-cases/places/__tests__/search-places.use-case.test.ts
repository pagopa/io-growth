import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { makeSearchPlacesUseCase } from "../search-places.use-case.js";
import {
  createMockPlaceRepository,
  MOCK_OPERATOR_ID,
  mockPlaceOffline,
  mockPlaceOnline,
  mockPlaces,
} from "./mocks.js";

describe("makeSearchPlacesUseCase", () => {
  it("should return places matching the query", async () => {
    const placeRepository = createMockPlaceRepository({
      findAllByFullText: vi.fn().mockResolvedValue(ok(mockPlaces)),
    });
    const useCase = makeSearchPlacesUseCase(placeRepository);

    const result = await useCase({ query: "alessandria" });

    expect(result).toEqual(ok(mockPlaces));
    expect(placeRepository.findAllByFullText).toHaveBeenCalledWith({
      query: "alessandria",
    });
  });

  it("should pass limit when provided", async () => {
    const placeRepository = createMockPlaceRepository({
      findAllByFullText: vi.fn().mockResolvedValue(ok(mockPlaces)),
    });
    const useCase = makeSearchPlacesUseCase(placeRepository);

    await useCase({ limit: 10, query: "alessandria" });

    expect(placeRepository.findAllByFullText).toHaveBeenCalledWith({
      limit: 10,
      query: "alessandria",
    });
  });

  it("should return empty array when no results found", async () => {
    const placeRepository = createMockPlaceRepository({
      findAllByFullText: vi.fn().mockResolvedValue(ok([])),
    });
    const useCase = makeSearchPlacesUseCase(placeRepository);

    const result = await useCase({ query: "nessunrisultato" });

    expect(result).toEqual(ok([]));
  });

  it("should propagate repository errors", async () => {
    const repoError = new GenericError("DB connection failed");
    const placeRepository = createMockPlaceRepository({
      findAllByFullText: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeSearchPlacesUseCase(placeRepository);

    const result = await useCase({ query: "alessandria" });

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when query is shorter than 3 characters", async () => {
    const placeRepository = createMockPlaceRepository();
    const useCase = makeSearchPlacesUseCase(placeRepository);

    const result = await useCase({ query: "al" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(placeRepository.findAllByFullText).not.toHaveBeenCalled();
  });

  it("should return items with type 'profile' and structured address for operator profile", async () => {
    const placeRepository = createMockPlaceRepository({
      findAllByFullText: vi.fn().mockResolvedValue(ok([mockPlaceOffline])),
    });
    const useCase = makeSearchPlacesUseCase(placeRepository);

    const result = await useCase({ query: "comune" });

    if (!result.isOk()) throw new Error("Expected ok result");
    const [item] = result.value;
    expect(item.type).toBe("profile");
    expect(item.address).toEqual({
      city: "Alessandria",
      postalCode: "15121",
      state: "AL",
      street: "Piazza della Libertà 1",
    });
    expect(item.url).toBeUndefined();
  });

  it("should return items with type 'place' and structured address for offline place", async () => {
    const offlinePlace = {
      address: {
        city: "Roma",
        postalCode: "00100",
        state: "RM",
        street: "Via Roma 1",
      },
      entityId: MOCK_OPERATOR_ID,
      id: "01JVMK3N8XQZP5T6G2WYHAB4CH",
      name: "Sportello centrale",
      type: "place" as const,
    };
    const placeRepository = createMockPlaceRepository({
      findAllByFullText: vi.fn().mockResolvedValue(ok([offlinePlace])),
    });
    const useCase = makeSearchPlacesUseCase(placeRepository);

    const result = await useCase({ query: "sportello" });

    if (!result.isOk()) throw new Error("Expected ok result");
    const [item] = result.value;
    expect(item.type).toBe("place");
    expect(item.address).not.toBeNull();
    expect(item.url).toBeUndefined();
  });

  it("should return items with type 'place', null address and url for online place", async () => {
    const placeRepository = createMockPlaceRepository({
      findAllByFullText: vi.fn().mockResolvedValue(ok([mockPlaceOnline])),
    });
    const useCase = makeSearchPlacesUseCase(placeRepository);

    const result = await useCase({ query: "flixbus" });

    if (!result.isOk()) throw new Error("Expected ok result");
    const [item] = result.value;
    expect(item.type).toBe("place");
    expect(item.address).toBeNull();
    expect(item.url).toBe("https://flixbus.it");
  });

  it("should return ValidationError when limit is not a positive integer", async () => {
    const placeRepository = createMockPlaceRepository();
    const useCase = makeSearchPlacesUseCase(placeRepository);

    const result = await useCase({ limit: -1, query: "alessandria" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(placeRepository.findAllByFullText).not.toHaveBeenCalled();
  });
});
