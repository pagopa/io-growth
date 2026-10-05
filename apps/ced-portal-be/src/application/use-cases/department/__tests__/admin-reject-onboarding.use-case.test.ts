import { GenericError, NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { ONBOARDING_STATUS } from "../../../../domain/entities/onboarding.js";
import { makeAdminRejectOnboardingUseCase } from "../admin-reject-onboarding.use-case.js";
import {
  createMockOnboardingRepository,
  MOCK_ONBOARDING_ID,
  MOCK_REFERENT_EXTERNAL_ID,
  mockOnboardingDetail,
} from "./mocks.js";

const validInput = {
  onboardingId: MOCK_ONBOARDING_ID,
  referentExternalId: MOCK_REFERENT_EXTERNAL_ID,
  rejectionMessage: "Soggetto non idoneo",
};

const makeRepository = (
  overrides?: Parameters<typeof createMockOnboardingRepository>[0],
) =>
  createMockOnboardingRepository({
    getById: vi.fn().mockResolvedValue(ok(mockOnboardingDetail())),
    rejectOnboarding: vi.fn().mockResolvedValue(ok(undefined)),
    ...overrides,
  });

describe("makeAdminRejectOnboardingUseCase — happy path", () => {
  it("should reject the request on Area Riservata, forwarding reason and acting user", async () => {
    const repository = makeRepository();
    const result =
      await makeAdminRejectOnboardingUseCase(repository)(validInput);

    expect(result).toEqual(ok(undefined));
    expect(repository.getById).toHaveBeenCalledWith(MOCK_ONBOARDING_ID);
    expect(repository.rejectOnboarding).toHaveBeenCalledWith({
      onboardingId: MOCK_ONBOARDING_ID,
      referentExternalId: MOCK_REFERENT_EXTERNAL_ID,
      rejectionMessage: validInput.rejectionMessage,
    });
  });
});

describe("makeAdminRejectOnboardingUseCase — preconditions", () => {
  it.each([
    ONBOARDING_STATUS.COMPLETED,
    ONBOARDING_STATUS.DELETED,
    ONBOARDING_STATUS.FAILED,
    ONBOARDING_STATUS.PENDING,
    ONBOARDING_STATUS.REJECTED,
    ONBOARDING_STATUS.REQUEST,
    ONBOARDING_STATUS.TOBEVALIDATED,
  ])("should refuse a request in status %s", async (status) => {
    const repository = makeRepository({
      getById: vi.fn().mockResolvedValue(ok(mockOnboardingDetail({ status }))),
    });
    const result =
      await makeAdminRejectOnboardingUseCase(repository)(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "PreconditionFailedError" })),
    );
    expect(repository.rejectOnboarding).not.toHaveBeenCalled();
  });

  it("should refuse a request whose status Area Riservata did not return", async () => {
    // `OnboardingDetail.status` is an unvalidated optional string: an absent
    // value must not slip through the precondition.
    const repository = makeRepository({
      getById: vi
        .fn()
        .mockResolvedValue(ok(mockOnboardingDetail({ status: undefined }))),
    });
    const result =
      await makeAdminRejectOnboardingUseCase(repository)(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "PreconditionFailedError" })),
    );
    expect(repository.rejectOnboarding).not.toHaveBeenCalled();
  });
});

describe("makeAdminRejectOnboardingUseCase — input validation", () => {
  it.each([
    ["empty", ""],
    ["over the 4096 cap", "x".repeat(4097)],
  ])("should reject a reason %s", async (_label, rejectionMessage) => {
    const repository = makeRepository();
    const result = await makeAdminRejectOnboardingUseCase(repository)({
      ...validInput,
      rejectionMessage,
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(repository.getById).not.toHaveBeenCalled();
  });

  it("should accept a reason exactly at the 4096 cap", async () => {
    const repository = makeRepository();
    const result = await makeAdminRejectOnboardingUseCase(repository)({
      ...validInput,
      rejectionMessage: "x".repeat(4096),
    });

    expect(result).toEqual(ok(undefined));
  });
});

describe("makeAdminRejectOnboardingUseCase — failures", () => {
  it("should propagate a missing onboarding without calling Area Riservata", async () => {
    const repository = makeRepository({
      getById: vi
        .fn()
        .mockResolvedValue(
          err(new NotFoundError("Onboarding", MOCK_ONBOARDING_ID)),
        ),
    });
    const result =
      await makeAdminRejectOnboardingUseCase(repository)(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(repository.rejectOnboarding).not.toHaveBeenCalled();
  });

  it("should propagate a failure of the rejection itself", async () => {
    const repository = makeRepository({
      rejectOnboarding: vi
        .fn()
        .mockResolvedValue(
          err(new GenericError("rejectOnboarding failed with status 403")),
        ),
    });
    const result =
      await makeAdminRejectOnboardingUseCase(repository)(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "GenericError" })),
    );
  });
});
