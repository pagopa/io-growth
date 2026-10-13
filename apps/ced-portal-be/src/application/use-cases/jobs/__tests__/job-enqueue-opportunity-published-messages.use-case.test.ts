import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OpportunityNotificationRepository } from "../../../../domain/ports/outbound/persistence/opportunity-notification.repository.js";

import { createMockTracingRepository } from "../../__tests__/mocks.js";
import { makeJobEnqueueOpportunityPublishedMessagesUseCase } from "../job-enqueue-opportunity-published-messages.use-case.js";

const makeDeps = (counts: number[]) => {
  const enqueuePublishedMessages = vi.fn();
  for (const count of counts)
    enqueuePublishedMessages.mockResolvedValueOnce(ok(count));
  enqueuePublishedMessages.mockResolvedValue(ok(0));

  const opportunityNotificationRepository: OpportunityNotificationRepository = {
    enqueuePublishedMessages,
  };
  const tracingRepository = createMockTracingRepository();

  return { opportunityNotificationRepository, tracingRepository };
};

const makeUseCase = (deps: ReturnType<typeof makeDeps>) =>
  makeJobEnqueueOpportunityPublishedMessagesUseCase(
    "prod",
    deps.opportunityNotificationRepository,
    deps.tracingRepository,
  );

describe("makeJobEnqueueOpportunityPublishedMessagesUseCase", () => {
  it("should run once and stop when fewer than a full batch is notified", async () => {
    const deps = makeDeps([3]);

    const result = await makeUseCase(deps)({});

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityNotificationRepository.enqueuePublishedMessages,
    ).toHaveBeenCalledExactlyOnceWith(500);
  });

  it("should keep going while full batches are returned", async () => {
    const deps = makeDeps([500, 500, 12]);

    const result = await makeUseCase(deps)({});

    expect(result).toEqual(ok(undefined));
    expect(
      deps.opportunityNotificationRepository.enqueuePublishedMessages,
    ).toHaveBeenCalledTimes(3);
    expect(deps.tracingRepository.emitEvent).toHaveBeenCalledWith(
      "jobs.opportunity-published.enqueued",
      expect.objectContaining({
        data: expect.objectContaining({ count: 1012 }),
      }),
    );
  });

  it("should return the repository error", async () => {
    const deps = makeDeps([]);
    const error = new GenericError("db down");
    vi.mocked(
      deps.opportunityNotificationRepository.enqueuePublishedMessages,
    ).mockReset();
    vi.mocked(
      deps.opportunityNotificationRepository.enqueuePublishedMessages,
    ).mockResolvedValue(err(error));

    const result = await makeUseCase(deps)({});

    expect(result).toEqual(err(error));
    expect(deps.tracingRepository.emitEvent).not.toHaveBeenCalled();
  });
});
