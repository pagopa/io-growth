import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";

import { makeOperatorRequestOpportunityRepublishUseCase } from "../operator-request-opportunity-republish.use-case.js";
import { createMockOpportunityRepository, MOCK_OPERATOR_ID } from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const mockOpportunity = (
  overrides: Partial<OpportunityDetail> = {},
): OpportunityDetail => ({
  beneficiaryBenefit: {
    discountType: "percentage",
    type: "discount",
    value: 20,
  },
  caregiverBenefit: { type: "free" },
  categoryId: "01KRJXEYD44B58700GT982CCYY",
  categoryTitle: "Cultura e tempo libero",
  createdAt: "2026-01-01T00:00:00.000Z",
  dateFrom: "2026-01-01",
  dateTo: "2026-12-31",
  id: MOCK_OPPORTUNITY_ID,
  localizedMetadata: [{ key: "name", language: "it", value: "Discount 20%" }],
  nationalTerritory: false,
  operatorId: MOCK_OPERATOR_ID,
  placeIds: ["01JVMK3N8XQZP5T6G2WYHAB4CD"],
  republishMessage: null,
  republishRejectionMessage: null,
  status: "suspended",
  suspendedBy: "department",
  suspendFrom: null,
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
  ...overrides,
});

const makeDeps = (
  overrides?: Partial<Parameters<typeof createMockOpportunityRepository>[0]>,
) => ({
  opportunityRepository: createMockOpportunityRepository({
    findByIdAndOperatorId: vi.fn().mockResolvedValue(ok(mockOpportunity())),
    requestRepublishByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    ...overrides,
  }),
});

const validInput = {
  operatorId: MOCK_OPERATOR_ID,
  opportunityId: MOCK_OPPORTUNITY_ID,
  republishMessage: "Abbiamo corretto le condizioni segnalate",
};

describe("makeOperatorRequestOpportunityRepublishUseCase - happy path", () => {
  it("should register the request on a department-suspended opportunity", async () => {
    const deps = makeDeps();
    const useCase = makeOperatorRequestOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.requestRepublishByIdAndOperatorId,
    ).toHaveBeenCalledWith({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
      republishMessage: validInput.republishMessage,
    });
  });

  it("should trim the message before persisting it", async () => {
    const deps = makeDeps();
    const useCase = makeOperatorRequestOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    const result = await useCase({
      ...validInput,
      republishMessage: "   Condizioni corrette   ",
    });

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.requestRepublishByIdAndOperatorId,
    ).toHaveBeenCalledWith({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
      republishMessage: "Condizioni corrette",
    });
  });

  it("should allow a new request after a previous rejection", async () => {
    const deps = makeDeps({
      findByIdAndOperatorId: vi.fn().mockResolvedValue(
        ok(
          mockOpportunity({
            republishRejectionMessage: "Motivo non sufficiente",
          }),
        ),
      ),
    });
    const useCase = makeOperatorRequestOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase(validInput)).resolves.toEqual(ok(undefined));
  });
});

describe("makeOperatorRequestOpportunityRepublishUseCase - guard", () => {
  it("should return NotFoundError when the opportunity does not exist", async () => {
    const deps = makeDeps({
      findByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeOperatorRequestOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase(validInput)).resolves.toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(
      deps.opportunityRepository.requestRepublishByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it.each([
    "draft",
    "test_pending",
    "test_rejected",
    "test_passed",
    "published",
    "deleted",
  ] as const)(
    "should return PreconditionFailedError when the opportunity is %s",
    async (status) => {
      const deps = makeDeps({
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity({ status }))),
      });
      const useCase = makeOperatorRequestOpportunityRepublishUseCase(
        deps.opportunityRepository,
      );

      await expect(useCase(validInput)).resolves.toEqual(
        err(
          expect.objectContaining({
            kind: "PreconditionFailedError",
            message:
              "Precondition failed: Opportunity must be suspended to request its republication",
          }),
        ),
      );
    },
  );

  it("should refuse when the operator suspended the opportunity itself", async () => {
    const deps = makeDeps({
      findByIdAndOperatorId: vi
        .fn()
        .mockResolvedValue(ok(mockOpportunity({ suspendedBy: "operator" }))),
    });
    const useCase = makeOperatorRequestOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase(validInput)).resolves.toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: Only a department-suspended opportunity can be requested for republication",
        }),
      ),
    );
    expect(
      deps.opportunityRepository.requestRepublishByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should refuse a second request while one is pending", async () => {
    const deps = makeDeps({
      findByIdAndOperatorId: vi.fn().mockResolvedValue(
        ok(
          mockOpportunity({
            republishMessage: "Richiesta precedente",
          }),
        ),
      ),
    });
    const useCase = makeOperatorRequestOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase(validInput)).resolves.toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: A republish request is already pending on this opportunity",
        }),
      ),
    );
    expect(
      deps.opportunityRepository.requestRepublishByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });
});

describe("makeOperatorRequestOpportunityRepublishUseCase - error propagation", () => {
  it("should return ConflictError when the state changed concurrently", async () => {
    const deps = makeDeps({
      requestRepublishByIdAndOperatorId: vi
        .fn()
        .mockResolvedValue(
          err(
            new ConflictError("Opportunity status was modified concurrently"),
          ),
        ),
    });
    const useCase = makeOperatorRequestOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase(validInput)).resolves.toEqual(
      err(expect.objectContaining({ kind: "ConflictError" })),
    );
  });

  it("should propagate an error from the read", async () => {
    const repoError = new GenericError("DB connection failed");
    const deps = makeDeps({
      findByIdAndOperatorId: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeOperatorRequestOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase(validInput)).resolves.toEqual(err(repoError));
  });
});

describe("makeOperatorRequestOpportunityRepublishUseCase - input validation", () => {
  it.each([
    ["opportunityId not a ULID", { opportunityId: "not-a-ulid" }],
    ["operatorId not a ULID", { operatorId: "not-a-ulid" }],
    ["empty message", { republishMessage: "" }],
    ["whitespace-only message", { republishMessage: "   " }],
    ["message too long", { republishMessage: "x".repeat(4097) }],
  ])("should return ValidationError on %s", async (_label, override) => {
    const deps = makeDeps();
    const useCase = makeOperatorRequestOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(useCase({ ...validInput, ...override })).resolves.toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should accept a message of exactly 4096 characters", async () => {
    const deps = makeDeps();
    const useCase = makeOperatorRequestOpportunityRepublishUseCase(
      deps.opportunityRepository,
    );

    await expect(
      useCase({ ...validInput, republishMessage: "x".repeat(4096) }),
    ).resolves.toEqual(ok(undefined));
  });
});
