import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { ulid } from "ulid";
import { describe, expect, it, vi } from "vitest";

import type { PlaceRepository } from "../../../../domain/ports/outbound/persistence/place.repository.js";

import { makeDeleteOperatorPlaceUseCase } from "../delete-operator-place.use-case.js";

const OPERATOR_ID = ulid();
const PLACE_ID = ulid();

const mockPlace = {
  id: PLACE_ID,
  name: "Test Place",
  supportContacts: [],
  type: "offline" as const,
};

const makeMockRepo = (
  overrides: Partial<PlaceRepository> = {},
): PlaceRepository => ({
  create: vi.fn().mockResolvedValue(ok(undefined)),
  delete: vi.fn().mockResolvedValue(ok(undefined)),
  existsById: vi.fn().mockResolvedValue(ok(true)),
  getById: vi.fn().mockResolvedValue(ok(mockPlace)),
  getIdsByOperator: vi.fn().mockResolvedValue(ok([])),
  hasOpportunityLinks: vi.fn().mockResolvedValue(ok(false)),
  hasProfile: vi.fn().mockResolvedValue(ok(false)),
  listByOperatorId: vi.fn().mockResolvedValue(ok([])),
  update: vi.fn().mockResolvedValue(ok(undefined)),
  ...overrides,
});

describe("makeDeleteOperatorPlaceUseCase", () => {
  it("should succeed when place exists and has no profile or opportunity links", async () => {
    const mockRepo = makeMockRepo();
    const useCase = makeDeleteOperatorPlaceUseCase(mockRepo);

    const result = await useCase({
      operatorId: OPERATOR_ID,
      placeId: PLACE_ID,
    });

    expect(result).toEqual(ok(undefined));
    expect(mockRepo.existsById).toHaveBeenCalledWith({
      operatorId: OPERATOR_ID,
      placeId: PLACE_ID,
    });
    expect(mockRepo.hasProfile).toHaveBeenCalledWith({
      operatorId: OPERATOR_ID,
      placeId: PLACE_ID,
    });
    expect(mockRepo.hasOpportunityLinks).toHaveBeenCalledWith(PLACE_ID);
    expect(mockRepo.delete).toHaveBeenCalledTimes(1);
  });

  it("should return ConflictError when place has an associated operator profile", async () => {
    const mockRepo = makeMockRepo({
      hasProfile: vi.fn().mockResolvedValue(ok(true)),
    });
    const useCase = makeDeleteOperatorPlaceUseCase(mockRepo);

    const result = await useCase({
      operatorId: OPERATOR_ID,
      placeId: PLACE_ID,
    });

    expect(result).toEqual(err(expect.any(ConflictError)));
    expect(mockRepo.hasOpportunityLinks).not.toHaveBeenCalled();
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it("should return ConflictError when place is linked to an opportunity", async () => {
    const mockRepo = makeMockRepo({
      hasOpportunityLinks: vi.fn().mockResolvedValue(ok(true)),
    });
    const useCase = makeDeleteOperatorPlaceUseCase(mockRepo);

    const result = await useCase({
      operatorId: OPERATOR_ID,
      placeId: PLACE_ID,
    });

    expect(result).toEqual(err(expect.any(ConflictError)));
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it("should return NotFoundError when place doesn't exist", async () => {
    const mockRepo = makeMockRepo({
      existsById: vi.fn().mockResolvedValue(ok(false)),
    });
    const useCase = makeDeleteOperatorPlaceUseCase(mockRepo);

    const result = await useCase({
      operatorId: OPERATOR_ID,
      placeId: PLACE_ID,
    });

    expect(result).toEqual(err(expect.any(NotFoundError)));
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it("should return ValidationError for invalid input", async () => {
    const mockRepo = makeMockRepo();
    const useCase = makeDeleteOperatorPlaceUseCase(mockRepo);

    const result = await useCase({
      operatorId: "not-ulid",
      placeId: "",
    });

    expect(result).toEqual(err(expect.any(ValidationError)));
    expect(mockRepo.getById).not.toHaveBeenCalled();
  });
});
