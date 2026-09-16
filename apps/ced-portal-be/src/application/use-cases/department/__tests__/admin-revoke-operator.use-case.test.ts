import {
  GenericError,
  NotFoundError,
  PreconditionFailedError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OnboardingDetail } from "../../../../domain/entities/onboarding.js";
import type { Operator } from "../../../../domain/entities/operator.js";

import { ONBOARDING_STATUS } from "../../../../domain/entities/onboarding.js";
import { makeAdminRevokeOperatorUseCase } from "../admin-revoke-operator.use-case.js";

const ONBOARDING_ID = "onboarding-2986";
const OPERATOR_EXTERNAL_ID = "2986aaaa-0000-4000-8000-000000000001";
const OPERATOR_ID = "01JREV00000000000000000001";

const mockOnboarding = (
  status: string = ONBOARDING_STATUS.COMPLETED,
  institutionId: string | undefined = OPERATOR_EXTERNAL_ID,
): OnboardingDetail => ({
  id: ONBOARDING_ID,
  institution: institutionId ? { id: institutionId } : undefined,
  status,
});

const mockOperator: Operator = {
  externalId: OPERATOR_EXTERNAL_ID,
  id: OPERATOR_ID,
  name: "Ente Recesso",
  status: "active",
};

const makeDeps = (overrides?: {
  deleteOnboarding?: ReturnType<typeof vi.fn>;
  getByExternalId?: ReturnType<typeof vi.fn>;
  getById?: ReturnType<typeof vi.fn>;
  refreshAll?: ReturnType<typeof vi.fn>;
  revokeById?: ReturnType<typeof vi.fn>;
  revokeByOperatorExternalId?: ReturnType<typeof vi.fn>;
}) => ({
  arOnboardingRepository: {
    deleteOnboarding:
      overrides?.deleteOnboarding ?? vi.fn().mockResolvedValue(ok(undefined)),
    getById:
      overrides?.getById ?? vi.fn().mockResolvedValue(ok(mockOnboarding())),
  },
  materializedViewRepository: {
    refreshAll:
      overrides?.refreshAll ?? vi.fn().mockResolvedValue(ok(undefined)),
  },
  operatorRepository: {
    getByExternalId:
      overrides?.getByExternalId ?? vi.fn().mockResolvedValue(ok(mockOperator)),
    revokeById: overrides?.revokeById ?? vi.fn().mockResolvedValue(ok(3)),
  },
  sessionRepository: {
    revokeByOperatorExternalId:
      overrides?.revokeByOperatorExternalId ??
      vi.fn().mockResolvedValue(ok(undefined)),
  },
});

const validInput = {
  onboardingId: ONBOARDING_ID,
  revocationMessage: "Violazione delle condizioni di convenzione",
};

describe("makeAdminRevokeOperatorUseCase — happy path", () => {
  it("should revoke on AR, write the tombstone and cascade on the operator", async () => {
    const deps = makeDeps();
    const result = await makeAdminRevokeOperatorUseCase(deps)(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.arOnboardingRepository.deleteOnboarding).toHaveBeenCalledWith(
      ONBOARDING_ID,
    );
    expect(
      deps.sessionRepository.revokeByOperatorExternalId,
    ).toHaveBeenCalledWith(OPERATOR_EXTERNAL_ID);
    expect(deps.operatorRepository.revokeById).toHaveBeenCalledWith(
      expect.objectContaining({
        operatorId: OPERATOR_ID,
        revocationMessage: validInput.revocationMessage,
      }),
    );
    expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledWith();
  });

  it("should succeed without touching the database when the operator row does not exist", async () => {
    const deps = makeDeps({
      getByExternalId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const result = await makeAdminRevokeOperatorUseCase(deps)(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.arOnboardingRepository.deleteOnboarding).toHaveBeenCalledWith(
      ONBOARDING_ID,
    );
    expect(
      deps.sessionRepository.revokeByOperatorExternalId,
    ).toHaveBeenCalledWith(OPERATOR_EXTERNAL_ID);
    expect(deps.operatorRepository.revokeById).not.toHaveBeenCalled();
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("should still succeed when refreshing the materialized views fails", async () => {
    const deps = makeDeps({
      refreshAll: vi.fn().mockResolvedValue(err(new GenericError("boom"))),
    });
    const result = await makeAdminRevokeOperatorUseCase(deps)(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.operatorRepository.revokeById).toHaveBeenCalledWith(
      expect.objectContaining({ operatorId: OPERATOR_ID }),
    );
  });
});

describe("makeAdminRevokeOperatorUseCase — preconditions", () => {
  it.each([
    ONBOARDING_STATUS.PENDING_IN_REVIEW,
    ONBOARDING_STATUS.REJECTED,
    ONBOARDING_STATUS.FAILED,
    ONBOARDING_STATUS.DELETED,
  ])("should refuse an onboarding in status %s", async (status) => {
    const deps = makeDeps({
      getById: vi.fn().mockResolvedValue(ok(mockOnboarding(status))),
    });
    const result = await makeAdminRevokeOperatorUseCase(deps)(validInput);

    expect(result).toEqual(err(expect.any(PreconditionFailedError)));
    expect(deps.arOnboardingRepository.deleteOnboarding).not.toHaveBeenCalled();
    expect(
      deps.sessionRepository.revokeByOperatorExternalId,
    ).not.toHaveBeenCalled();
    expect(deps.operatorRepository.revokeById).not.toHaveBeenCalled();
  });

  it("should refuse an onboarding without an institution id", async () => {
    const deps = makeDeps({
      // Built inline on purpose: passing `undefined` to `mockOnboarding` would
      // fall back to its default parameter and yield an institution id anyway.
      getById: vi.fn().mockResolvedValue(
        ok({
          id: ONBOARDING_ID,
          status: ONBOARDING_STATUS.COMPLETED,
        }),
      ),
    });
    const result = await makeAdminRevokeOperatorUseCase(deps)(validInput);

    expect(result).toEqual(err(expect.any(GenericError)));
    expect(deps.arOnboardingRepository.deleteOnboarding).not.toHaveBeenCalled();
  });

  it("should reject an empty revocation message", async () => {
    const deps = makeDeps();
    const result = await makeAdminRevokeOperatorUseCase(deps)({
      ...validInput,
      revocationMessage: "",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.arOnboardingRepository.getById).not.toHaveBeenCalled();
  });
});

describe("makeAdminRevokeOperatorUseCase — failures leave no partial state", () => {
  it("should not write anything in CED when Area Riservata fails", async () => {
    const deps = makeDeps({
      deleteOnboarding: vi
        .fn()
        .mockResolvedValue(err(new GenericError("deleteOnboarding failed"))),
    });
    const result = await makeAdminRevokeOperatorUseCase(deps)(validInput);

    expect(result).toEqual(err(expect.any(GenericError)));
    expect(
      deps.sessionRepository.revokeByOperatorExternalId,
    ).not.toHaveBeenCalled();
    expect(deps.operatorRepository.revokeById).not.toHaveBeenCalled();
  });

  it("should not touch the database when the tombstone cannot be written", async () => {
    const deps = makeDeps({
      revokeByOperatorExternalId: vi
        .fn()
        .mockResolvedValue(err(new GenericError("redis down"))),
    });
    const result = await makeAdminRevokeOperatorUseCase(deps)(validInput);

    expect(result).toEqual(err(expect.any(GenericError)));
    expect(deps.operatorRepository.revokeById).not.toHaveBeenCalled();
  });

  it("should propagate a conflict when the operator has already been revoked", async () => {
    const deps = makeDeps({
      revokeById: vi
        .fn()
        .mockResolvedValue(err(new NotFoundError("Operator", OPERATOR_ID))),
    });
    const result = await makeAdminRevokeOperatorUseCase(deps)(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(deps.materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });
});
