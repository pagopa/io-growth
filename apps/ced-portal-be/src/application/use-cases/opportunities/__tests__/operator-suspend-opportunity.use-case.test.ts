import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";
import type { MaterializedViewRepository } from "../../../../domain/ports/outbound/materialized-view.repository.js";

import { makeOperatorSuspendOpportunityUseCase } from "../operator-suspend-opportunity.use-case.js";
import {
  createMockMaterializedViewRepository,
  createMockOpportunityRepository,
  createMockProfileRepository,
  MOCK_ADMIN_EMAIL,
  MOCK_EMAIL_LINKS,
  MOCK_MAILING_CONFIG,
  MOCK_OPERATOR_ID,
  mockProfile,
} from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const TODAY = "2026-07-15";

const mockOpportunity = (
  status: OpportunityDetail["status"],
  suspendFrom: null | string = null,
): OpportunityDetail => ({
  beneficiaryBenefit: {
    discountType: "percentage",
    type: "discount",
    value: 20,
  },
  caregiverBenefit: { type: "free" },
  categoryId: "01KRJXEYD44B58700GT982CCYY",
  categoryLabel: "culture_sport",
  createdAt: "2026-01-01T00:00:00.000Z",
  dateFrom: "2026-01-01",
  dateTo: "2026-12-31",
  id: MOCK_OPPORTUNITY_ID,
  localizedMetadata: [{ key: "name", language: "it", value: "Discount 20%" }],
  nationalTerritory: false,
  placeIds: ["01JVMK3N8XQZP5T6G2WYHAB4CD"],
  status,
  suspendFrom,
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
});

const makeDeps = (overrides?: {
  materializedViewRepository?: Partial<MaterializedViewRepository>;
  opportunityRepository?: Partial<
    Parameters<typeof createMockOpportunityRepository>[0]
  >;
  profileRepository?: Parameters<typeof createMockProfileRepository>[0];
}) => ({
  materializedViewRepository: createMockMaterializedViewRepository(
    overrides?.materializedViewRepository,
  ),
  opportunityRepository: createMockOpportunityRepository(
    overrides?.opportunityRepository,
  ),
  profileRepository: createMockProfileRepository(overrides?.profileRepository),
});

const makeUseCase = (deps: ReturnType<typeof makeDeps>) =>
  makeOperatorSuspendOpportunityUseCase(
    deps.opportunityRepository,
    deps.materializedViewRepository,
    deps.profileRepository,
    MOCK_MAILING_CONFIG,
  );

const expectedMessage = (suspensionDate: string) => ({
  templateAttributes: {
    operatorName: mockProfile.displayName,
    opportunityName: "Discount 20%",
    suspensionDate,
    suspensionMessage: "Chiuso per manutenzione",
    ...MOCK_EMAIL_LINKS,
  },
  templateId: "ced_admin-opportunity-suspended_v1",
  to: MOCK_ADMIN_EMAIL,
  type: "template",
});

const validInput = {
  operatorId: MOCK_OPERATOR_ID,
  opportunityId: MOCK_OPPORTUNITY_ID,
  suspendFrom: TODAY,
  suspensionMessage: "Chiuso per manutenzione",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T10:00:00.000Z`));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("makeOperatorSuspendOpportunityUseCase - immediate vs scheduled", () => {
  it.each([TODAY, "2026-07-14", "2020-01-01"])(
    "should suspend immediately when suspendFrom (%s) is today or in the past",
    async (suspendFrom) => {
      const deps = makeDeps({
        materializedViewRepository: {
          refreshAll: vi.fn().mockResolvedValue(ok(undefined)),
        },
        opportunityRepository: {
          findByIdAndOperatorId: vi
            .fn()
            .mockResolvedValue(ok(mockOpportunity("published"))),
          suspendByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
        },
      });
      const useCase = makeUseCase(deps);

      const result = await useCase({ ...validInput, suspendFrom });

      expect(result).toEqual(ok(undefined));
      // The requested date is not persisted for an immediate suspension.
      expect(
        deps.opportunityRepository.suspendByIdAndOperatorId,
      ).toHaveBeenCalledWith({
        operatorId: MOCK_OPERATOR_ID,
        opportunityId: MOCK_OPPORTUNITY_ID,
        outboxMessages: [expectedMessage("15/07/2026")],
        suspendFrom: undefined,
        suspensionMessage: "Chiuso per manutenzione",
      });
      expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledOnce();
    },
  );

  it("should schedule the suspension when suspendFrom is in the future", async () => {
    const deps = makeDeps({
      materializedViewRepository: { refreshAll: vi.fn() },
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("published"))),
        suspendByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeUseCase(deps);

    const result = await useCase({ ...validInput, suspendFrom: "2026-07-16" });

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.suspendByIdAndOperatorId,
    ).toHaveBeenCalledWith({
      operatorId: MOCK_OPERATOR_ID,
      opportunityId: MOCK_OPPORTUNITY_ID,
      outboxMessages: [expectedMessage("16/07/2026")],
      suspendFrom: "2026-07-16",
      suspensionMessage: "Chiuso per manutenzione",
    });
    // A scheduled suspension does not change visibility yet.
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("should trim surrounding whitespace from the suspension message", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("published"))),
        suspendByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeUseCase(deps);

    await useCase({ ...validInput, suspensionMessage: "  Manutenzione  " });

    expect(
      deps.opportunityRepository.suspendByIdAndOperatorId,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        outboxMessages: [
          expect.objectContaining({
            templateAttributes: expect.objectContaining({
              suspensionMessage: "Manutenzione",
            }),
          }),
        ],
        suspensionMessage: "Manutenzione",
      }),
    );
  });

  it("should format the effective date as dd/mm/yyyy in the admin email", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("published"))),
        suspendByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });

    const result = await makeUseCase(deps)({
      ...validInput,
      suspendFrom: "2027-01-02",
    });

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityRepository.suspendByIdAndOperatorId,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        outboxMessages: [expectedMessage("02/01/2027")],
      }),
    );
  });
});

describe("makeOperatorSuspendOpportunityUseCase - status guard", () => {
  it("should return NotFoundError when the opportunity does not exist", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeUseCase(deps);

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(
      deps.opportunityRepository.suspendByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should return PreconditionFailedError when the opportunity is not yet live (scheduled)", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("scheduled"))),
      },
    });
    const useCase = makeUseCase(deps);

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: Opportunity is not yet live and cannot be suspended",
        }),
      ),
    );
    expect(
      deps.opportunityRepository.suspendByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it.each(["draft", "test_pending", "test_rejected", "suspended"] as const)(
    "should return PreconditionFailedError when status is %s",
    async (status) => {
      const deps = makeDeps({
        opportunityRepository: {
          findByIdAndOperatorId: vi
            .fn()
            .mockResolvedValue(ok(mockOpportunity(status))),
        },
      });
      const useCase = makeUseCase(deps);

      const result = await useCase(validInput);

      expect(result).toEqual(
        err(
          expect.objectContaining({
            kind: "PreconditionFailedError",
            message:
              "Precondition failed: Opportunity must be in published status to be suspended",
          }),
        ),
      );
      expect(
        deps.opportunityRepository.suspendByIdAndOperatorId,
      ).not.toHaveBeenCalled();
    },
  );

  it("should return PreconditionFailedError when a scheduled suspension is already pending", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("published", "2026-08-01"))),
      },
    });
    const useCase = makeUseCase(deps);

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: A scheduled suspension is already pending for this opportunity",
        }),
      ),
    );
    expect(
      deps.opportunityRepository.suspendByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should report the pending suspension when the derived status is scheduled_suspension", async () => {
    // In the real read path the mapper derives "scheduled_suspension" for a
    // published opportunity with a pending suspendFrom: the pending check must
    // win over the generic non-published guard.
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(
            ok(mockOpportunity("scheduled_suspension", "2026-08-01")),
          ),
      },
    });
    const useCase = makeUseCase(deps);

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "PreconditionFailedError",
          message:
            "Precondition failed: A scheduled suspension is already pending for this opportunity",
        }),
      ),
    );
    expect(
      deps.opportunityRepository.suspendByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should reject an immediate suspension when a scheduled one is already pending", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("published", "2026-08-01"))),
      },
    });
    const useCase = makeUseCase(deps);

    const result = await useCase({ ...validInput, suspendFrom: TODAY });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "PreconditionFailedError" })),
    );
    expect(
      deps.opportunityRepository.suspendByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });
});

describe("makeOperatorSuspendOpportunityUseCase - error propagation", () => {
  it.each([
    ["profile lookup fails", err(new GenericError("Profile unavailable"))],
    ["profile is missing", ok(undefined)],
  ])(
    "should suspend without notifying the admin when %s",
    async (_, profileResult) => {
      const deps = makeDeps({
        opportunityRepository: {
          findByIdAndOperatorId: vi
            .fn()
            .mockResolvedValue(ok(mockOpportunity("published"))),
          suspendByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
        },
        profileRepository: {
          getByOperatorId: vi.fn().mockResolvedValue(profileResult),
        },
      });

      const result = await makeUseCase(deps)(validInput);

      expect(result).toEqual(ok(undefined));
      expect(deps.profileRepository.getByOperatorId).toHaveBeenCalledWith(
        MOCK_OPERATOR_ID,
      );
      expect(
        deps.opportunityRepository.suspendByIdAndOperatorId,
      ).toHaveBeenCalledWith({
        ...validInput,
        outboxMessages: [],
        suspendFrom: undefined,
      });
      expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledOnce();
    },
  );

  it("should propagate an outbox persistence failure without refreshing views", async () => {
    const outboxError = new GenericError("Failed to enqueue suspension email");
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("published"))),
        suspendByIdAndOperatorId: vi.fn().mockResolvedValue(err(outboxError)),
      },
    });

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(err(outboxError));
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("should return ConflictError on concurrent modification", async () => {
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("published"))),
        suspendByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(
            err(
              new ConflictError("Opportunity status was modified concurrently"),
            ),
          ),
      },
    });
    const useCase = makeUseCase(deps);

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ConflictError" })),
    );
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("should still suspend when refreshAll fails (best-effort)", async () => {
    const deps = makeDeps({
      materializedViewRepository: {
        refreshAll: vi
          .fn()
          .mockResolvedValue(
            err(new GenericError("Failed to refresh materialized views")),
          ),
      },
      opportunityRepository: {
        findByIdAndOperatorId: vi
          .fn()
          .mockResolvedValue(ok(mockOpportunity("published"))),
        suspendByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
      },
    });
    const useCase = makeUseCase(deps);

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledOnce();
  });

  it("should propagate an error from findByIdAndOperatorId", async () => {
    const repoError = new GenericError("DB connection failed");
    const deps = makeDeps({
      opportunityRepository: {
        findByIdAndOperatorId: vi.fn().mockResolvedValue(err(repoError)),
      },
    });
    const useCase = makeUseCase(deps);

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
    expect(
      deps.opportunityRepository.suspendByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });
});

describe("makeOperatorSuspendOpportunityUseCase - input validation", () => {
  it("should return ValidationError when suspensionMessage is whitespace-only", async () => {
    const deps = makeDeps();
    const useCase = makeUseCase(deps);

    const result = await useCase({ ...validInput, suspensionMessage: "   " });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it("should return ValidationError when suspensionMessage exceeds the max length", async () => {
    const deps = makeDeps();
    const useCase = makeUseCase(deps);

    const result = await useCase({
      ...validInput,
      suspensionMessage: "x".repeat(4097),
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });

  it.each(["", "not-a-date", "2026-13-01", "15-07-2026"])(
    "should return ValidationError when suspendFrom (%s) is missing or not an ISO date",
    async (suspendFrom) => {
      const deps = makeDeps();
      const useCase = makeUseCase(deps);

      const result = await useCase({ ...validInput, suspendFrom });

      expect(result).toEqual(
        err(expect.objectContaining({ kind: "ValidationError" })),
      );
      expect(
        deps.opportunityRepository.findByIdAndOperatorId,
      ).not.toHaveBeenCalled();
    },
  );

  it("should return ValidationError when operatorId is not a ULID", async () => {
    const deps = makeDeps();
    const useCase = makeUseCase(deps);

    const result = await useCase({ ...validInput, operatorId: "invalid" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(
      deps.opportunityRepository.findByIdAndOperatorId,
    ).not.toHaveBeenCalled();
  });
});
