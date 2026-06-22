import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";

import { makeGetOpportunityUseCase } from "../get-opportunity.use-case.js";
import { createMockOpportunityRepository } from "./mocks.js";

const mockOpportunityDetail: OpportunityDetail = {
  beneficiaryBenefit: {
    discountType: "percentage",
    type: "discount",
    value: 20,
  },
  caregiverBenefit: {
    discountType: null,
    type: "free",
    value: null,
  },
  category: "Cultura e tempo libero",
  condition: "Riservato ai titolari della Carta Europea della Disabilità.",
  dateFrom: "2026-01-01",
  dateTo: "2026-12-31",
  description: "20% di sconto sulla quota mensile per portatori di disabilità.",
  id: "01JVMK3N8XQZP5T6G2WYHAB4CD",
  language: "it",
  name: "Sconto mensile palestra",
  nationalTerritory: false,
  places: [
    {
      city: "Roma",
      country: "IT",
      id: "01JVMK3N8XQZP5T6G2WYHAB4CF",
      name: "Palestra FitLife Roma Centro",
      postalCode: "00186",
      state: "Lazio",
      street: "Via del Corso, 10",
      type: "offline",
      url: null,
    },
  ],
  url: "https://example.com/offerta-ced",
};

describe("makeGetOpportunityUseCase", () => {
  it("should return the published opportunity detail when found", async () => {
    const opportunityRepository = createMockOpportunityRepository({
      findPublishedById: vi.fn().mockResolvedValue(ok(mockOpportunityDetail)),
    });
    const useCase = makeGetOpportunityUseCase(opportunityRepository);

    const result = await useCase({
      language: "it",
      opportunityId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
    });

    expect(result).toEqual(ok(mockOpportunityDetail));
    expect(opportunityRepository.findPublishedById).toHaveBeenCalledWith({
      language: "it",
      opportunityId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
    });
  });

  it("should default language to italian", async () => {
    const opportunityRepository = createMockOpportunityRepository({
      findPublishedById: vi.fn().mockResolvedValue(ok(mockOpportunityDetail)),
    });
    const useCase = makeGetOpportunityUseCase(opportunityRepository);

    await useCase({ opportunityId: "01JVMK3N8XQZP5T6G2WYHAB4CD" });

    expect(opportunityRepository.findPublishedById).toHaveBeenCalledWith({
      language: "it",
      opportunityId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
    });
  });

  it("should propagate repository errors", async () => {
    const repositoryError = new GenericError("DB connection failed");
    const opportunityRepository = createMockOpportunityRepository({
      findPublishedById: vi.fn().mockResolvedValue(err(repositoryError)),
    });
    const useCase = makeGetOpportunityUseCase(opportunityRepository);

    const result = await useCase({
      language: "it",
      opportunityId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
    });

    expect(result).toEqual(err(repositoryError));
  });

  it("should return NotFoundError when the opportunity is not visible", async () => {
    const opportunityRepository = createMockOpportunityRepository({
      findPublishedById: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeGetOpportunityUseCase(opportunityRepository);

    const result = await useCase({
      language: "it",
      opportunityId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
  });

  it("should return ValidationError when opportunityId is empty", async () => {
    const opportunityRepository = createMockOpportunityRepository();
    const useCase = makeGetOpportunityUseCase(opportunityRepository);

    const result = await useCase({
      language: "it",
      opportunityId: "",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(opportunityRepository.findPublishedById).not.toHaveBeenCalled();
  });
});
