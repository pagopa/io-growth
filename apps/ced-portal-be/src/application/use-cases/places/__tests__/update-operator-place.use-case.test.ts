import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { ulid } from "ulid";
import { describe, expect, it, vi } from "vitest";

import type { PlaceRepository } from "../../../../domain/ports/outbound/persistence/place.repository.js";

import { makeUpdateOperatorPlaceUseCase } from "../update-operator-place.use-case.js";

const OPERATOR_ID = ulid();
const PLACE_ID = ulid();

const mockPlace = {
  address: {
    city: "Roma",
    country: "IT",
    postalCode: "00100",
    state: "RM",
    street: "Via Roma 2",
  },
  id: PLACE_ID,
  name: "Updated Name",
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

describe("makeUpdateOperatorPlaceUseCase", () => {
  it("should succeed when place exists and has no profile", async () => {
    const mockRepo = makeMockRepo();
    const useCase = makeUpdateOperatorPlaceUseCase(mockRepo);

    const result = await useCase({
      operatorId: OPERATOR_ID,
      place: {
        address: {
          city: "Roma",
          country: "IT",
          postalCode: "00100",
          state: "RM",
          street: "Via Roma 2",
        },
        name: "Updated Name",
        supportContacts: [{ type: "email", value: "new@example.com" }],
        type: "offline",
      },
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
    expect(mockRepo.update).toHaveBeenCalledTimes(1);
  });

  it("should return ConflictError when place has an associated operator profile", async () => {
    const mockRepo = makeMockRepo({
      hasProfile: vi.fn().mockResolvedValue(ok(true)),
    });
    const useCase = makeUpdateOperatorPlaceUseCase(mockRepo);

    const result = await useCase({
      operatorId: OPERATOR_ID,
      place: {
        address: {
          city: "Roma",
          country: "IT",
          postalCode: "00100",
          state: "RM",
          street: "Via Roma 2",
        },
        name: "Updated Name",
        supportContacts: [],
        type: "offline",
      },
      placeId: PLACE_ID,
    });

    expect(result).toEqual(err(expect.any(ConflictError)));
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("should return NotFoundError when place doesn't exist", async () => {
    const mockRepo = makeMockRepo({
      existsById: vi.fn().mockResolvedValue(ok(false)),
    });
    const useCase = makeUpdateOperatorPlaceUseCase(mockRepo);

    const result = await useCase({
      operatorId: OPERATOR_ID,
      place: {
        address: {
          city: "C",
          country: "IT",
          postalCode: "1",
          state: "ST",
          street: "S",
        },
        name: "X",
        supportContacts: [],
        type: "offline",
      },
      placeId: PLACE_ID,
    });

    expect(result).toEqual(err(expect.any(NotFoundError)));
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("should return ValidationError for invalid input", async () => {
    const mockRepo = makeMockRepo();
    const useCase = makeUpdateOperatorPlaceUseCase(mockRepo);

    const result = await useCase({
      operatorId: "invalid-not-ulid",
      place: {
        address: {
          city: "",
          country: "",
          postalCode: "",
          state: "",
          street: "",
        },
        name: "",
        supportContacts: [],
        type: "offline",
      },
      placeId: "x",
    });

    expect(result).toEqual(err(expect.any(ValidationError)));
    expect(mockRepo.getById).not.toHaveBeenCalled();
  });
});
