import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { makeGetOperatorPlaceUseCase } from "../get-operator-place.use-case.js";
import {
  createMockPlaceRepository,
  MOCK_OPERATOR_ID,
  MOCK_PLACE_ID,
  mockPlace,
} from "./mocks.js";

describe("makeGetOperatorPlaceUseCase", () => {
  it("should return the operator place when it exists", async () => {
    const placeRepository = createMockPlaceRepository({
      getById: vi.fn().mockResolvedValue(ok(mockPlace)),
    });
    const useCase = makeGetOperatorPlaceUseCase(placeRepository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      placeId: MOCK_PLACE_ID,
    });

    expect(result).toEqual(ok(mockPlace));
    expect(placeRepository.getById).toHaveBeenCalledWith({
      operatorId: MOCK_OPERATOR_ID,
      placeId: MOCK_PLACE_ID,
    });
  });

  it("should return NotFoundError when the place does not exist", async () => {
    const placeRepository = createMockPlaceRepository({
      getById: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeGetOperatorPlaceUseCase(placeRepository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      placeId: MOCK_PLACE_ID,
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
    const placeRepository = createMockPlaceRepository({
      getById: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeGetOperatorPlaceUseCase(placeRepository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      placeId: MOCK_PLACE_ID,
    });

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when placeId is invalid", async () => {
    const placeRepository = createMockPlaceRepository({
      getById: vi.fn().mockResolvedValue(ok(mockPlace)),
    });
    const useCase = makeGetOperatorPlaceUseCase(placeRepository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
      placeId: "invalid-place-id",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(placeRepository.getById).not.toHaveBeenCalled();
  });
});
