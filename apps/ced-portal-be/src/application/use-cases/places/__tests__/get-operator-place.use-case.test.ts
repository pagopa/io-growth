import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { PlaceRepository } from "../../../../domain/ports/outbound/persistence/place.repository.js";

import { makeGetOperatorPlaceUseCase } from "../get-operator-place.use-case.js";

const mockPlace = {
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
};

const createMockPlaceRepository = (
  place?: typeof mockPlace,
): PlaceRepository => ({
  create: vi.fn(),
  getById: vi.fn().mockResolvedValue(ok(place)),
  listByOperatorId: vi.fn(),
});

describe("makeGetOperatorPlaceUseCase", () => {
  it("should return the operator place when it exists", async () => {
    const placeRepository = createMockPlaceRepository(mockPlace);
    const useCase = makeGetOperatorPlaceUseCase(placeRepository);

    const result = await useCase({
      operatorId: "231b5e36-ec82-49f1-a889-3e49107304f1",
      placeId: "8eec93a7-7850-4a6c-a3fd-1c5d6202b2e0",
    });

    expect(result).toEqual(ok(mockPlace));
    expect(placeRepository.getById).toHaveBeenCalledWith({
      operatorId: "231b5e36-ec82-49f1-a889-3e49107304f1",
      placeId: "8eec93a7-7850-4a6c-a3fd-1c5d6202b2e0",
    });
  });

  it("should return NotFoundError when the place does not exist", async () => {
    const placeRepository = createMockPlaceRepository(undefined);
    const useCase = makeGetOperatorPlaceUseCase(placeRepository);

    const result = await useCase({
      operatorId: "231b5e36-ec82-49f1-a889-3e49107304f1",
      placeId: "8eec93a7-7850-4a6c-a3fd-1c5d6202b2e0",
    });

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "NotFoundError",
          message: "Unable to find Place: not found",
        }),
      ),
    );
  });

  it("should propagate repository errors", async () => {
    const repoError = new GenericError("DB connection failed");
    const placeRepository: PlaceRepository = {
      create: vi.fn(),
      getById: vi.fn().mockResolvedValue(err(repoError)),
      listByOperatorId: vi.fn(),
    };
    const useCase = makeGetOperatorPlaceUseCase(placeRepository);

    const result = await useCase({
      operatorId: "231b5e36-ec82-49f1-a889-3e49107304f1",
      placeId: "8eec93a7-7850-4a6c-a3fd-1c5d6202b2e0",
    });

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when placeId is invalid", async () => {
    const placeRepository = createMockPlaceRepository(mockPlace);
    const useCase = makeGetOperatorPlaceUseCase(placeRepository);

    const result = await useCase({
      operatorId: "231b5e36-ec82-49f1-a889-3e49107304f1",
      placeId: "invalid-place-id",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(placeRepository.getById).not.toHaveBeenCalled();
  });
});
