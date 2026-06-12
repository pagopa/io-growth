import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { createArOnboardingRepository } from "../ar-onboarding.repository.js";
import {
  createMockDocumentContentRepository,
  createMockInstitutionRepository,
  createMockOnboardingRepository,
  MOCK_MISSING_ONBOARDING_ID,
  MOCK_ONBOARDING_ID,
  MOCK_PRODUCT_ID,
  mockArOnboardingDetailItem,
  mockArSearchOnboardingsResponse,
  mockOnboardingDetail,
} from "./mocks.js";

const createRepository = ({
  getOnboardingWithFilter = vi.fn(),
  searchOnboardings = vi.fn(),
} = {}) =>
  createArOnboardingRepository(
    createMockInstitutionRepository({ searchOnboardings }),
    createMockOnboardingRepository({ getOnboardingWithFilter }),
    createMockDocumentContentRepository(),
  );

describe("createArOnboardingRepository", () => {
  it("should map the name filter to searchText", async () => {
    const searchOnboardings = vi.fn().mockResolvedValue(
      ok({
        onboardings: [],
        totalElements: 0,
      }),
    );
    const repository = createRepository({ searchOnboardings });

    await repository.listByProduct({
      name: "Comune di Roma",
      page: 1,
      productId: MOCK_PRODUCT_ID,
      size: 10,
      statuses: ["REQUEST"],
    });

    expect(searchOnboardings).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      products: ["prod-io-ced"],
      searchText: "Comune di Roma",
      statuses: ["REQUEST"],
    });
  });

  it("should preserve institution data when institutionId is missing", async () => {
    const repository = createRepository({
      searchOnboardings: vi
        .fn()
        .mockResolvedValue(ok(mockArSearchOnboardingsResponse)),
    });

    const result = await repository.listByProduct({
      page: 0,
      productId: MOCK_PRODUCT_ID,
      size: 20,
    });

    expect(result).toEqual(
      ok(
        expect.objectContaining({
          count: 1,
          items: [
            expect.objectContaining({
              institution: {
                description: "Comune di Roma",
                id: undefined,
                taxCode: "12345678901",
              },
              status: "PENDING",
            }),
          ],
        }),
      ),
    );
  });

  it("should preserve full AR payload for getById", async () => {
    const repository = createRepository({
      getOnboardingWithFilter: vi.fn().mockResolvedValue(
        ok({
          items: [mockArOnboardingDetailItem],
        }),
      ),
    });

    const result = await repository.getById(MOCK_ONBOARDING_ID);

    expect(result).toEqual(ok(mockOnboardingDetail));
  });

  it("should return NotFoundError when getById finds no AR item", async () => {
    const repository = createRepository({
      getOnboardingWithFilter: vi.fn().mockResolvedValue(
        ok({
          items: [],
        }),
      ),
    });

    const result = await repository.getById(MOCK_MISSING_ONBOARDING_ID);

    expect(result).toEqual(
      err(
        expect.objectContaining({
          entityName: "Onboarding",
          kind: "NotFoundError",
          message:
            "Unable to find Onboarding: Onboarding not found: missing-onboarding",
        }),
      ),
    );
  });
});
