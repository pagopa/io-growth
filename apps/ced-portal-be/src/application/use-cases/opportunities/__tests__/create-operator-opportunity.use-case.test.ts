import { GenericError, ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OperatorRepository } from "../../../../domain/ports/outbound/persistence/operator.repository.js";
import type { OpportunityCategoryRepository } from "../../../../domain/ports/outbound/persistence/opportunity-category.repository.js";
import type { PlaceRepository } from "../../../../domain/ports/outbound/persistence/place.repository.js";

import { makeCreateOperatorOpportunityUseCase } from "../create-operator-opportunity.use-case.js";
import {
  createMockOpportunityRepository,
  MOCK_OPERATOR_ID,
  MOCK_PLACE_ID,
  mockCreateOpportunityInput,
} from "./mocks.js";

const createMockOperatorRepository = (
  overrides?: Partial<OperatorRepository>,
): OperatorRepository => ({
  create: vi.fn(),
  getByExternalId: vi.fn(),
  getById: vi.fn().mockResolvedValue(
    ok({
      externalId: "ext",
      id: MOCK_OPERATOR_ID,
      name: "Op",
      status: "active",
    }),
  ),
  ...overrides,
});

const createMockOpportunityCategoryRepository = (
  overrides?: Partial<OpportunityCategoryRepository>,
): OpportunityCategoryRepository => ({
  getById: vi.fn().mockResolvedValue(
    ok({
      description: "desc",
      id: mockCreateOpportunityInput.categoryId,
      title: "title",
    }),
  ),
  list: vi.fn(),
  ...overrides,
});

const createMockPlaceRepository = (
  overrides?: Partial<PlaceRepository>,
): PlaceRepository => ({
  create: vi.fn(),
  getById: vi.fn(),
  getIdsByOperator: vi
    .fn()
    .mockResolvedValue(ok(mockCreateOpportunityInput.placeIds)),
  listByOperatorId: vi.fn(),
  ...overrides,
});

const makeDeps = (overrides?: {
  operatorRepository?: Partial<OperatorRepository>;
  opportunityCategoryRepository?: Partial<OpportunityCategoryRepository>;
  opportunityRepository?: Partial<
    Parameters<typeof createMockOpportunityRepository>[0]
  >;
  placeRepository?: Partial<PlaceRepository>;
}) => ({
  operatorRepository: createMockOperatorRepository(
    overrides?.operatorRepository,
  ),
  opportunityCategoryRepository: createMockOpportunityCategoryRepository(
    overrides?.opportunityCategoryRepository,
  ),
  opportunityRepository: createMockOpportunityRepository({
    create: vi.fn().mockResolvedValue(ok(undefined)),
    ...overrides?.opportunityRepository,
  }),
  placeRepository: createMockPlaceRepository(overrides?.placeRepository),
});

describe("makeCreateOperatorOpportunityUseCase - success", () => {
  it("should create an operator opportunity in draft status", async () => {
    const deps = makeDeps();
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const result = await useCase(mockCreateOpportunityInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.opportunityRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        operatorId: mockCreateOpportunityInput.operatorId,
        opportunity: expect.objectContaining({
          beneficiaryBenefit: expect.objectContaining({
            discountType: "percentage",
            id: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
            type: "discount",
            value: 20,
          }),
          caregiverBenefit: expect.objectContaining({
            id: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
            type: "free",
          }),
          id: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
          localizedMetadata: expect.arrayContaining([
            expect.objectContaining({
              id: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
              key: "name",
              language: "it",
              value: "Sconto 20%",
            }),
          ]),
          placeIds: mockCreateOpportunityInput.placeIds,
          status: "draft",
          url: mockCreateOpportunityInput.url,
        }),
      }),
    );
  });

  it("should pass categoryId through to the repository", async () => {
    const deps = makeDeps();
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    await useCase(mockCreateOpportunityInput);

    expect(deps.opportunityRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        opportunity: expect.objectContaining({
          categoryId: "01KRJXEYD44B58700GT982CCYY",
        }),
      }),
    );
  });

  it("should generate unique ULIDs for opportunity, benefits, and metadata", async () => {
    const deps = makeDeps();
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    await useCase(mockCreateOpportunityInput);

    const call = vi.mocked(deps.opportunityRepository.create).mock.calls[0];
    const opp = call?.[0].opportunity;
    const allIds = [
      opp?.id,
      opp?.beneficiaryBenefit.id,
      opp?.caregiverBenefit?.id,
      ...(opp?.localizedMetadata.map((lm) => lm.id) ?? []),
    ].filter(Boolean);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it("should propagate repository errors", async () => {
    const repoError = new GenericError("DB write failed");
    const deps = makeDeps({
      opportunityRepository: {
        create: vi.fn().mockResolvedValue(err(repoError)),
      },
    });
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const result = await useCase(mockCreateOpportunityInput);

    expect(result).toEqual(err(repoError));
  });

  it("should accept optional dateTo, url, and caregiverBenefit as undefined", async () => {
    const deps = makeDeps();
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const inputWithoutOptionals = {
      beneficiaryBenefit: mockCreateOpportunityInput.beneficiaryBenefit,
      categoryId: mockCreateOpportunityInput.categoryId,
      dateFrom: mockCreateOpportunityInput.dateFrom,
      localizedMetadata: mockCreateOpportunityInput.localizedMetadata,
      operatorId: mockCreateOpportunityInput.operatorId,
      placeIds: mockCreateOpportunityInput.placeIds,
    };
    const result = await useCase(inputWithoutOptionals);

    expect(result).toEqual(ok(undefined));
    expect(deps.opportunityRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        opportunity: expect.objectContaining({
          caregiverBenefit: undefined,
          dateTo: undefined,
          status: "draft",
          url: undefined,
        }),
      }),
    );
  });

  it("should handle free benefit type with no extra fields", async () => {
    const deps = makeDeps();
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const input = {
      ...mockCreateOpportunityInput,
      beneficiaryBenefit: { type: "free" as const },
    };
    const result = await useCase(input);

    expect(result).toEqual(ok(undefined));
    expect(deps.opportunityRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        opportunity: expect.objectContaining({
          beneficiaryBenefit: expect.objectContaining({
            type: "free",
          }),
        }),
      }),
    );
  });

  it("should handle other benefit type with description", async () => {
    const deps = makeDeps();
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const input = {
      ...mockCreateOpportunityInput,
      beneficiaryBenefit: {
        description: "Benefit speciale",
        type: "other" as const,
      },
    };
    const result = await useCase(input);

    expect(result).toEqual(ok(undefined));
    expect(deps.opportunityRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        opportunity: expect.objectContaining({
          beneficiaryBenefit: expect.objectContaining({
            description: "Benefit speciale",
            type: "other",
          }),
        }),
      }),
    );
  });
});

describe("makeCreateOperatorOpportunityUseCase - validation", () => {
  it("should return ValidationError when operatorId is not a valid ULID", async () => {
    const deps = makeDeps();
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const result = await useCase({
      ...mockCreateOpportunityInput,
      operatorId: "not-a-valid-ulid",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.create).not.toHaveBeenCalled();
  });

  it("should return ValidationError when placeIds is empty", async () => {
    const deps = makeDeps();
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const result = await useCase({
      ...mockCreateOpportunityInput,
      placeIds: [],
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.create).not.toHaveBeenCalled();
  });

  it("should return ValidationError when localizedMetadata is empty", async () => {
    const deps = makeDeps();
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const result = await useCase({
      ...mockCreateOpportunityInput,
      localizedMetadata: [],
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.create).not.toHaveBeenCalled();
  });

  it("should return ValidationError when benefit type is invalid", async () => {
    const deps = makeDeps();
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const result = await useCase({
      ...mockCreateOpportunityInput,
      beneficiaryBenefit: {
        type: "invalid" as "free",
      },
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.create).not.toHaveBeenCalled();
  });

  it("should return ValidationError when categoryId is empty", async () => {
    const deps = makeDeps();
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const result = await useCase({
      ...mockCreateOpportunityInput,
      categoryId: "",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.create).not.toHaveBeenCalled();
  });

  it("should return ValidationError when discount is missing discountType", async () => {
    const deps = makeDeps();
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const result = await useCase({
      ...mockCreateOpportunityInput,
      beneficiaryBenefit: {
        type: "discount",
        value: 10,
      } as typeof mockCreateOpportunityInput.beneficiaryBenefit,
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.opportunityRepository.create).not.toHaveBeenCalled();
  });
});

describe("makeCreateOperatorOpportunityUseCase - existence validation", () => {
  it("should return ValidationError when operator does not exist", async () => {
    const deps = makeDeps({
      operatorRepository: {
        getById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const result = await useCase(mockCreateOpportunityInput);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toContain(MOCK_OPERATOR_ID);
    expect(deps.opportunityRepository.create).not.toHaveBeenCalled();
  });

  it("should return ValidationError when category does not exist", async () => {
    const deps = makeDeps({
      opportunityCategoryRepository: {
        getById: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const result = await useCase(mockCreateOpportunityInput);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toContain(mockCreateOpportunityInput.categoryId);
    expect(deps.opportunityRepository.create).not.toHaveBeenCalled();
  });

  it("should return ValidationError when one or more places do not exist", async () => {
    const deps = makeDeps({
      placeRepository: {
        getIdsByOperator: vi.fn().mockResolvedValue(ok([])),
      },
    });
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const result = await useCase(mockCreateOpportunityInput);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toContain(MOCK_PLACE_ID);
    expect(deps.opportunityRepository.create).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from existence checks", async () => {
    const repoError = new GenericError("DB read failed");
    const deps = makeDeps({
      operatorRepository: {
        getById: vi.fn().mockResolvedValue(err(repoError)),
      },
    });
    const useCase = makeCreateOperatorOpportunityUseCase(deps);

    const result = await useCase(mockCreateOpportunityInput);

    expect(result).toEqual(err(repoError));
    expect(deps.opportunityRepository.create).not.toHaveBeenCalled();
  });
});
