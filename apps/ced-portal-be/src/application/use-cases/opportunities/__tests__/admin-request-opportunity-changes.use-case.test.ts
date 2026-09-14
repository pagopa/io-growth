import { ConflictError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { makeAdminRequestOpportunityChangesUseCase } from "../admin-request-opportunity-changes.use-case.js";
import {
  createMockOpportunityRepository,
  mockOpportunityDetail,
} from "./mocks.js";

const input = {
  opportunityId: mockOpportunityDetail.id,
  rejectionMessage: "Correggere le condizioni dell'agevolazione.",
};

describe("makeAdminRequestOpportunityChangesUseCase", () => {
  it("stores the comment and moves an opportunity under review to test_rejected", async () => {
    const opportunityRepository = createMockOpportunityRepository({
      findById: vi
        .fn()
        .mockResolvedValue(
          ok({ ...mockOpportunityDetail, status: "test_pending" }),
        ),
      requestChangesById: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeAdminRequestOpportunityChangesUseCase(
      opportunityRepository,
    );

    const result = await useCase(input);

    expect(result).toEqual(ok(undefined));
    expect(opportunityRepository.requestChangesById).toHaveBeenCalledWith({
      expectedStatus: "test_pending",
      opportunityId: input.opportunityId,
      rejectionMessage: input.rejectionMessage,
    });
  });

  it("rejects an opportunity not under review", async () => {
    const opportunityRepository = createMockOpportunityRepository({
      findById: vi.fn().mockResolvedValue(ok(mockOpportunityDetail)),
    });
    const useCase = makeAdminRequestOpportunityChangesUseCase(
      opportunityRepository,
    );

    const result = await useCase(input);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "PreconditionFailedError" })),
    );
  });

  it("returns a concurrent modification error", async () => {
    const conflictError = new ConflictError("Concurrent modification");
    const opportunityRepository = createMockOpportunityRepository({
      findById: vi
        .fn()
        .mockResolvedValue(
          ok({ ...mockOpportunityDetail, status: "test_pending" }),
        ),
      requestChangesById: vi.fn().mockResolvedValue(err(conflictError)),
    });
    const useCase = makeAdminRequestOpportunityChangesUseCase(
      opportunityRepository,
    );

    await expect(useCase(input)).resolves.toEqual(err(conflictError));
  });
});
