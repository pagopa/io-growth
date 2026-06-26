import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDrizzleMaterializedViewRepository } from "../drizzle-materialized-view.repository.js";

vi.mock("@pagopa/io-core-adapter-tracing", () => ({
  emitCustomEvent: vi.fn(() => vi.fn()),
}));

const makeDb = (refreshMaterializedView: ReturnType<typeof vi.fn>) =>
  ({ refreshMaterializedView }) as unknown as Parameters<
    typeof createDrizzleMaterializedViewRepository
  >[0];

describe("createDrizzleMaterializedViewRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return ok and not emit when all views refresh", async () => {
    const refreshMaterializedView = vi.fn().mockReturnValue({
      concurrently: () => Promise.resolve(undefined),
    });
    const repository = createDrizzleMaterializedViewRepository(
      makeDb(refreshMaterializedView),
    );

    const result = await repository.refreshAll();

    expect(result.isOk()).toBe(true);
    expect(refreshMaterializedView).toHaveBeenCalledTimes(2);
    expect(emitCustomEvent).not.toHaveBeenCalled();
  });

  it("should record the failing view with its reason, then return an error", async () => {
    const refreshMaterializedView = vi
      .fn()
      .mockReturnValueOnce({
        concurrently: () => Promise.reject(new Error("boom")),
      })
      .mockReturnValueOnce({
        concurrently: () => Promise.resolve(undefined),
      });
    const repository = createDrizzleMaterializedViewRepository(
      makeDb(refreshMaterializedView),
    );

    const result = await repository.refreshAll();

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toContain(
      "place_materialized_view (Error: boom)",
    );
    expect(emitCustomEvent).toHaveBeenCalledWith(
      "materialized_view.refresh_failed",
      expect.objectContaining({
        caller: "DrizzleMaterializedViewRepository",
        data: {
          failures: [
            { reason: "Error: boom", view: "place_materialized_view" },
          ],
        },
      }),
    );
  });
});
