import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { makeCreateOperatorPlaceUseCase } from "../create-operator-place.use-case.js";
import { createMockPlaceRepository, mockCreatePlaceInput } from "./mocks.js";

describe("makeCreateOperatorPlaceUseCase", () => {
  it("should create an operator place", async () => {
    const placeRepository = createMockPlaceRepository({
      create: vi.fn().mockImplementation(async ({ place }) => ok(place)),
    });
    const useCase = makeCreateOperatorPlaceUseCase(placeRepository);

    const result = await useCase(mockCreatePlaceInput);

    expect(result).toEqual(
      ok(
        expect.objectContaining({
          id: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
          name: mockCreatePlaceInput.place.name,
          type: mockCreatePlaceInput.place.type,
        }),
      ),
    );
    expect(placeRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        operatorId: mockCreatePlaceInput.operatorId,
        place: expect.objectContaining({
          id: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
          name: mockCreatePlaceInput.place.name,
          type: mockCreatePlaceInput.place.type,
        }),
      }),
    );
  });

  it("should propagate repository errors", async () => {
    const repoError = new GenericError("DB write failed");
    const placeRepository = createMockPlaceRepository({
      create: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeCreateOperatorPlaceUseCase(placeRepository);

    const result = await useCase(mockCreatePlaceInput);

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when operatorId is empty", async () => {
    const placeRepository = createMockPlaceRepository();
    const useCase = makeCreateOperatorPlaceUseCase(placeRepository);

    const result = await useCase({ ...mockCreatePlaceInput, operatorId: "" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(placeRepository.create).not.toHaveBeenCalled();
  });

  it("should return ValidationError when operatorId is not a valid ULID", async () => {
    const placeRepository = createMockPlaceRepository();
    const useCase = makeCreateOperatorPlaceUseCase(placeRepository);

    const result = await useCase({
      ...mockCreatePlaceInput,
      operatorId: "not-a-valid-ulid",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(placeRepository.create).not.toHaveBeenCalled();
  });

  it("should return ValidationError when place payload is invalid", async () => {
    const placeRepository = createMockPlaceRepository();
    const useCase = makeCreateOperatorPlaceUseCase(placeRepository);

    const result = await useCase({
      ...mockCreatePlaceInput,
      place: { ...mockCreatePlaceInput.place, type: "invalid" as "online" },
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(placeRepository.create).not.toHaveBeenCalled();
  });
});
