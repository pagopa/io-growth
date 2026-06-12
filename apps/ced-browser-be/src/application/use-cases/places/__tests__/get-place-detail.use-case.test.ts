import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { PlaceDetail } from "../../../../domain/ports/outbound/persistence/place.repository.js";

import { makeGetPlaceDetailUseCase } from "../get-place-detail.use-case.js";
import { createMockPlaceRepository } from "./mocks.js";

const mockAddress = {
  city: "Alessandria",
  postalCode: "15121",
  state: "AL",
  street: "Piazza della Libertà 1",
};

const mockDetail: PlaceDetail = {
  address: mockAddress,
  contacts: { phone: "0131123456", website: "https://example.com" },
  entityId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
  entityName: "Comune di Alessandria",
  id: "01JVMK3N8XQZP5T6G2WYHAB4CE",
  opportunities: [
    {
      benefit: { discountType: "percentage", type: "discount", value: 30 },
      id: "01JVMK3N8XQZP5T6G2WYHAB4CF",
      title: "Sconto 30%",
    },
  ],
  relatedPlaces: [
    {
      address: mockAddress,
      id: "01JVMK3N8XQZP5T6G2WYHAB4CG",
      title: "Filiale Nord",
    },
  ],
  title: "Sede principale",
};

const validInput = {
  language: "it" as const,
  placeId: "01JVMK3N8XQZP5T6G2WYHAB4CE",
};

describe("makeGetPlaceDetailUseCase", () => {
  it("should return place detail with raw benefit", async () => {
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(mockDetail)),
    });
    const useCase = makeGetPlaceDetailUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(
      ok({
        address: mockAddress,
        contacts: { phone: "0131123456", website: "https://example.com" },
        entityId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
        entityName: "Comune di Alessandria",
        id: "01JVMK3N8XQZP5T6G2WYHAB4CE",
        opportunities: [
          {
            benefit: {
              discountType: "percentage",
              type: "discount",
              value: 30,
            },
            id: "01JVMK3N8XQZP5T6G2WYHAB4CF",
            title: "Sconto 30%",
          },
        ],
        relatedPlaces: [
          {
            address: mockAddress,
            id: "01JVMK3N8XQZP5T6G2WYHAB4CG",
            title: "Filiale Nord",
          },
        ],
        title: "Sede principale",
      }),
    );
  });

  it("should default language to it when not provided", async () => {
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(mockDetail)),
    });
    const useCase = makeGetPlaceDetailUseCase(repository);

    await useCase({ placeId: validInput.placeId });

    expect(repository.findById).toHaveBeenCalledWith(
      expect.objectContaining({ language: "it" }),
    );
  });

  it("should propagate explicit language to repository", async () => {
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(mockDetail)),
    });
    const useCase = makeGetPlaceDetailUseCase(repository);

    await useCase({ language: "en", placeId: validInput.placeId });

    expect(repository.findById).toHaveBeenCalledWith(
      expect.objectContaining({ language: "en" }),
    );
  });

  it("should return NotFoundError when place does not exist", async () => {
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeGetPlaceDetailUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
  });

  it("should propagate repository GenericError", async () => {
    const repoError = new GenericError("DB connection failed");
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeGetPlaceDetailUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when placeId is empty", async () => {
    const repository = createMockPlaceRepository();
    const useCase = makeGetPlaceDetailUseCase(repository);

    const result = await useCase({ ...validInput, placeId: "" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it("should return ValidationError for invalid language", async () => {
    const repository = createMockPlaceRepository();
    const useCase = makeGetPlaceDetailUseCase(repository);

    const result = await useCase({ ...validInput, language: "xx" as never });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it("should pass contacts unchanged from repository", async () => {
    const detailWithPhone: PlaceDetail = {
      ...mockDetail,
      contacts: { phone: "0101010101" },
    };
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(detailWithPhone)),
    });
    const useCase = makeGetPlaceDetailUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(
      ok(expect.objectContaining({ contacts: { phone: "0101010101" } })),
    );
  });

  it("should pass null address unchanged for online places", async () => {
    const onlineDetail: PlaceDetail = {
      ...mockDetail,
      address: null,
      contacts: { website: "https://example.com" },
    };
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(onlineDetail)),
    });
    const useCase = makeGetPlaceDetailUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(ok(expect.objectContaining({ address: null })));
  });

  it("should pass benefit through unchanged from repository", async () => {
    const detail: PlaceDetail = {
      ...mockDetail,
      opportunities: [
        {
          benefit: { discountType: null, type: "free", value: null },
          id: "01JVMK3N8XQZP5T6G2WYHAB4CF",
          title: "Opportunità",
        },
      ],
    };
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(detail)),
    });
    const useCase = makeGetPlaceDetailUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(
      ok(
        expect.objectContaining({
          opportunities: [
            expect.objectContaining({
              benefit: { discountType: null, type: "free", value: null },
            }),
          ],
        }),
      ),
    );
  });
});
