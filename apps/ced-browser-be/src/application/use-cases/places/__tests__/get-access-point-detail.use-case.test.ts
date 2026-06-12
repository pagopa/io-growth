import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type {
  AccessPointBenefit,
  AccessPointDetail,
} from "../../../../domain/ports/outbound/persistence/place.repository.js";

import { makeGetAccessPointDetailUseCase } from "../get-access-point-detail.use-case.js";
import { createMockPlaceRepository } from "./mocks.js";

const mockAddress = {
  city: "Alessandria",
  postalCode: "15121",
  state: "AL",
  street: "Piazza della Libertà 1",
};

const mockDetail: AccessPointDetail = {
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
  relatedAccessPoints: [
    {
      address: mockAddress,
      id: "01JVMK3N8XQZP5T6G2WYHAB4CG",
      title: "Filiale Nord",
    },
  ],
  title: "Sede principale",
};

const validInput = {
  accessPointId: "01JVMK3N8XQZP5T6G2WYHAB4CE",
  language: "it" as const,
};

describe("makeGetAccessPointDetailUseCase", () => {
  it("should return access point detail with computed badgeLabel", async () => {
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(mockDetail)),
    });
    const useCase = makeGetAccessPointDetailUseCase(repository);

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
            badgeLabel: "-30%",
            id: "01JVMK3N8XQZP5T6G2WYHAB4CF",
            title: "Sconto 30%",
          },
        ],
        relatedAccessPoints: [
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
    const useCase = makeGetAccessPointDetailUseCase(repository);

    await useCase({ accessPointId: validInput.accessPointId });

    expect(repository.findById).toHaveBeenCalledWith(
      expect.objectContaining({ language: "it" }),
    );
  });

  it("should propagate explicit language to repository", async () => {
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(mockDetail)),
    });
    const useCase = makeGetAccessPointDetailUseCase(repository);

    await useCase({ accessPointId: validInput.accessPointId, language: "en" });

    expect(repository.findById).toHaveBeenCalledWith(
      expect.objectContaining({ language: "en" }),
    );
  });

  it("should return NotFoundError when place does not exist", async () => {
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeGetAccessPointDetailUseCase(repository);

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
    const useCase = makeGetAccessPointDetailUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when accessPointId is empty", async () => {
    const repository = createMockPlaceRepository();
    const useCase = makeGetAccessPointDetailUseCase(repository);

    const result = await useCase({ ...validInput, accessPointId: "" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it("should return ValidationError for invalid language", async () => {
    const repository = createMockPlaceRepository();
    const useCase = makeGetAccessPointDetailUseCase(repository);

    const result = await useCase({ ...validInput, language: "xx" as never });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it("should pass contacts unchanged from repository", async () => {
    const detailWithPhone: AccessPointDetail = {
      ...mockDetail,
      contacts: { phone: "0101010101" },
    };
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(detailWithPhone)),
    });
    const useCase = makeGetAccessPointDetailUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(
      ok(expect.objectContaining({ contacts: { phone: "0101010101" } })),
    );
  });

  it("should pass null address unchanged for online access points", async () => {
    const onlineDetail: AccessPointDetail = {
      ...mockDetail,
      address: null,
      contacts: { website: "https://example.com" },
    };
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(onlineDetail)),
    });
    const useCase = makeGetAccessPointDetailUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(ok(expect.objectContaining({ address: null })));
  });

  describe("computeBadgeLabel", () => {
    it.each<[AccessPointBenefit, string]>([
      [{ discountType: null, type: "free", value: null }, "GRATIS"],
      [{ discountType: null, type: "priority", value: null }, "PRIORITÀ"],
      [{ discountType: null, type: "reduced_fixed_price", value: 5 }, "5€"],
      [{ discountType: "percentage", type: "discount", value: 30 }, "-30%"],
      [{ discountType: "fixed_amount", type: "discount", value: 10 }, "-10€"],
      [{ discountType: null, type: "discount", value: null }, "ALTRO"],
      [{ discountType: null, type: "other", value: null }, "ALTRO"],
    ])("benefit %j → badgeLabel %s", async (benefit, expectedBadgeLabel) => {
      const detail: AccessPointDetail = {
        ...mockDetail,
        opportunities: [
          { benefit, id: "01JVMK3N8XQZP5T6G2WYHAB4CF", title: "Opportunità" },
        ],
      };
      const repository = createMockPlaceRepository({
        findById: vi.fn().mockResolvedValue(ok(detail)),
      });
      const useCase = makeGetAccessPointDetailUseCase(repository);

      const result = await useCase(validInput);

      expect(result).toEqual(
        ok(
          expect.objectContaining({
            opportunities: [
              expect.objectContaining({ badgeLabel: expectedBadgeLabel }),
            ],
          }),
        ),
      );
    });
  });
});
