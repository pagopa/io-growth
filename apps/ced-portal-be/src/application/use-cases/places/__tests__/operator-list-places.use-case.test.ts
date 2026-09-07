import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { makeOperatorListPlacesUseCase } from "../operator-list-places.use-case.js";
import {
  createMockPlaceRepository,
  MOCK_OPERATOR_ID,
  mockPlaces,
} from "./mocks.js";

describe("makeOperatorListPlacesUseCase", () => {
  it("should return operator places", async () => {
    const placeRepository = createMockPlaceRepository({
      listByOperatorId: vi.fn().mockResolvedValue(ok(mockPlaces)),
    });
    const useCase = makeOperatorListPlacesUseCase(placeRepository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
    });

    expect(result).toEqual(ok(mockPlaces));
    expect(placeRepository.listByOperatorId).toHaveBeenCalledWith(
      MOCK_OPERATOR_ID,
    );
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
});
