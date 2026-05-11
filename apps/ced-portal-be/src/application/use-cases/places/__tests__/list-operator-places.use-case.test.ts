import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { PlaceRepository } from "../../../../domain/ports/outbound/persistence/place.repository.js";

import { makeListOperatorPlacesUseCase } from "../list-operator-places.use-case.js";

const mockPlaces = [
  {
    id: "8eec93a7-7850-4a6c-a3fd-1c5d6202b2e0",
    name: "Sportello remoto",
    supportContacts: [
      {
        id: "36c92630-1836-4d2d-a3a2-3f50d8a9286f",
        type: "email" as const,
        value: "support@example.org",
      },
    ],
    type: "online" as const,
    website: {
      url: "https://example.org",
    },
  },
];

const createMockPlaceRepository = (places = mockPlaces): PlaceRepository => ({
  create: vi.fn(),
  getById: vi.fn(),
  listByOperatorId: vi.fn().mockResolvedValue(ok(places)),
});

describe("makeListOperatorPlacesUseCase", () => {
  it("should return operator places", async () => {
    const placeRepository = createMockPlaceRepository();
    const useCase = makeListOperatorPlacesUseCase(placeRepository);

    const result = await useCase({
      operatorId: "231b5e36-ec82-49f1-a889-3e49107304f1",
    });

    expect(result).toEqual(ok(mockPlaces));
    expect(placeRepository.listByOperatorId).toHaveBeenCalledWith(
      "231b5e36-ec82-49f1-a889-3e49107304f1",
    );
  });

  it("should propagate repository errors", async () => {
    const repoError = new GenericError("DB connection failed");
    const placeRepository: PlaceRepository = {
      create: vi.fn(),
      getById: vi.fn(),
      listByOperatorId: vi.fn().mockResolvedValue(err(repoError)),
    };
    const useCase = makeListOperatorPlacesUseCase(placeRepository);

    const result = await useCase({
      operatorId: "231b5e36-ec82-49f1-a889-3e49107304f1",
    });

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when operatorId is empty", async () => {
    const placeRepository = createMockPlaceRepository();
    const useCase = makeListOperatorPlacesUseCase(placeRepository);

    const result = await useCase({ operatorId: "" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(placeRepository.listByOperatorId).not.toHaveBeenCalled();
  });
});
