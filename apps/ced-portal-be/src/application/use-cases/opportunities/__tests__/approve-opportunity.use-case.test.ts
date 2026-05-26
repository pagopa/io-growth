import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";

import { makeApproveOpportunityUseCase } from "../approve-opportunity.use-case.js";
import { createMockOpportunityRepository } from "./mocks.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const mockOpportunity = (
  status: OpportunityDetail["status"],
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
  operatorName: "Comune di Roma",
  placeIds: ["01JVMK3N8XQZP5T6G2WYHAB4CD"],
  status,
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
});

const validInput = {
  opportunityId: MOCK_OPPORTUNITY_ID,
  userType: "admin" as const,
};

describe("makeApproveOpportunityUseCase", () => {
  it("should approve an opportunity in test_pending status", async () => {
    const repository = createMockOpportunityRepository({
      getByIdGlobal: vi
        .fn()
        .mockResolvedValue(ok(mockOpportunity("test_pending"))),
      updateStatusGlobal: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeApproveOpportunityUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(repository.updateStatusGlobal).toHaveBeenCalledWith({
      dateFrom: undefined,
      expectedStatuses: ["test_pending", "test_rejected"],
      opportunityId: MOCK_OPPORTUNITY_ID,
      status: "test_passed",
    });
  });

  it("should approve an opportunity in test_rejected status", async () => {
    const repository = createMockOpportunityRepository({
      getByIdGlobal: vi
        .fn()
        .mockResolvedValue(ok(mockOpportunity("test_rejected"))),
      updateStatusGlobal: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeApproveOpportunityUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(ok(undefined));
    expect(repository.updateStatusGlobal).toHaveBeenCalledWith(
      expect.objectContaining({ status: "test_passed" }),
    );
  });

  it("should pass dateFrom to updateStatusGlobal when provided", async () => {
    const repository = createMockOpportunityRepository({
      getByIdGlobal: vi
        .fn()
        .mockResolvedValue(ok(mockOpportunity("test_pending"))),
      updateStatusGlobal: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeApproveOpportunityUseCase(repository);

    await useCase({ ...validInput, dateFrom: "2026-09-01" });

    expect(repository.updateStatusGlobal).toHaveBeenCalledWith(
      expect.objectContaining({ dateFrom: "2026-09-01" }),
    );
  });

  it("should return NotFoundError when opportunity does not exist", async () => {
    const repository = createMockOpportunityRepository({
      getByIdGlobal: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeApproveOpportunityUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(repository.updateStatusGlobal).not.toHaveBeenCalled();
  });

  it.each([
    "draft",
    "test_passed",
    "published",
    "suspended",
    "deleted",
  ] as const)(
    "should return PreconditionFailedError when status is %s",
    async (status) => {
      const repository = createMockOpportunityRepository({
        getByIdGlobal: vi.fn().mockResolvedValue(ok(mockOpportunity(status))),
      });
      const useCase = makeApproveOpportunityUseCase(repository);

      const result = await useCase(validInput);

      expect(result).toEqual(
        err(expect.objectContaining({ kind: "PreconditionFailedError" })),
      );
      expect(repository.updateStatusGlobal).not.toHaveBeenCalled();
    },
  );

  it("should return ConflictError on concurrent modification", async () => {
    const conflictError = new ConflictError("Concurrent modification");
    const repository = createMockOpportunityRepository({
      getByIdGlobal: vi
        .fn()
        .mockResolvedValue(ok(mockOpportunity("test_pending"))),
      updateStatusGlobal: vi.fn().mockResolvedValue(err(conflictError)),
    });
    const useCase = makeApproveOpportunityUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(err(conflictError));
  });

  it("should propagate repository errors from getByIdGlobal", async () => {
    const repoError = new GenericError("DB connection failed");
    const repository = createMockOpportunityRepository({
      getByIdGlobal: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeApproveOpportunityUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
    expect(repository.updateStatusGlobal).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from updateStatusGlobal", async () => {
    const repoError = new GenericError("DB update failed");
    const repository = createMockOpportunityRepository({
      getByIdGlobal: vi
        .fn()
        .mockResolvedValue(ok(mockOpportunity("test_pending"))),
      updateStatusGlobal: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeApproveOpportunityUseCase(repository);

    const result = await useCase(validInput);

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when opportunityId is invalid", async () => {
    const repository = createMockOpportunityRepository();
    const useCase = makeApproveOpportunityUseCase(repository);

    const result = await useCase({
      ...validInput,
      opportunityId: "not-a-ulid",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(repository.getByIdGlobal).not.toHaveBeenCalled();
  });

  it("should return ValidationError when dateFrom is not a valid date", async () => {
    const repository = createMockOpportunityRepository();
    const useCase = makeApproveOpportunityUseCase(repository);

    const result = await useCase({ ...validInput, dateFrom: "not-a-date" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(repository.getByIdGlobal).not.toHaveBeenCalled();
  });
});
