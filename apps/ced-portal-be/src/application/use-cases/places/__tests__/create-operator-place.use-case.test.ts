import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { PlaceRepository } from "../../../../domain/ports/outbound/persistence/place.repository.js";

import { makeCreateOperatorPlaceUseCase } from "../create-operator-place.use-case.js";

const createInput = {
  operatorId: "231b5e36-ec82-49f1-a889-3e49107304f1",
  place: {
    name: "Sportello remoto",
    supportContacts: [{ type: "email" as const, value: "support@example.org" }],
    type: "online" as const,
    website: {
      url: "https://example.org",
    },
  },
};

const createMockPlaceRepository = (): PlaceRepository => ({
  create: vi.fn().mockResolvedValue(ok(undefined)),
  getById: vi.fn(),
  listByOperatorId: vi.fn(),
});

describe("makeCreateOperatorPlaceUseCase", () => {
  it("should create an operator place", async () => {
    const placeRepository = createMockPlaceRepository();
    const useCase = makeCreateOperatorPlaceUseCase(placeRepository);

    const result = await useCase(createInput);

    expect(result).toEqual(ok(undefined));
    expect(placeRepository.create).toHaveBeenCalledWith(createInput);
  });

  it("should propagate repository errors", async () => {
    const repoError = new GenericError("DB write failed");
    const placeRepository: PlaceRepository = {
      create: vi.fn().mockResolvedValue(err(repoError)),
      getById: vi.fn(),
      listByOperatorId: vi.fn(),
    };
    const useCase = makeCreateOperatorPlaceUseCase(placeRepository);

    const result = await useCase(createInput);

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when operatorId is empty", async () => {
    const placeRepository = createMockPlaceRepository();
    const useCase = makeCreateOperatorPlaceUseCase(placeRepository);

    const result = await useCase({ ...createInput, operatorId: "" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(placeRepository.create).not.toHaveBeenCalled();
  });

  it("should return ValidationError when place payload is invalid", async () => {
    const placeRepository = createMockPlaceRepository();
    const useCase = makeCreateOperatorPlaceUseCase(placeRepository);

    const result = await useCase({
      ...createInput,
      place: { ...createInput.place, type: "invalid" as "online" },
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(placeRepository.create).not.toHaveBeenCalled();
  });
});
