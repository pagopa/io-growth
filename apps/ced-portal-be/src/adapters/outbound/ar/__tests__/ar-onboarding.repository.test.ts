import type {
  DocumentContentRepository,
  InstitutionRepository,
  OnboardingRepository,
} from "@pagopa/io-core-adapter-ar";

import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { createArOnboardingRepository } from "../ar-onboarding.repository.js";

const createRepository = (searchOnboardings = vi.fn()) =>
  createArOnboardingRepository(
    {
      searchOnboardings,
    } as unknown as InstitutionRepository,
    {} as OnboardingRepository,
    {} as DocumentContentRepository,
  );

describe("createArOnboardingRepository", () => {
  it("should map the name filter to searchText", async () => {
    const searchOnboardings = vi.fn().mockResolvedValue(
      ok({
        onboardings: [],
        totalElements: 0,
      }),
    );
    const repository = createRepository(searchOnboardings);

    await repository.listByProduct({
      name: "Comune di Roma",
      page: 1,
      productId: "prod-io-ced",
      size: 10,
      status: "REQUEST",
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
    const repository = createRepository(
      vi.fn().mockResolvedValue(
        ok({
          onboardings: [
            {
              description: "Comune di Roma",
              onboardingId: "onb-1",
              productId: "prod-io-ced",
              status: "PENDING",
              taxCode: "12345678901",
            },
          ],
          totalElements: 1,
        }),
      ),
    );

    const result = await repository.listByProduct({
      page: 0,
      productId: "prod-io-ced",
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
});
