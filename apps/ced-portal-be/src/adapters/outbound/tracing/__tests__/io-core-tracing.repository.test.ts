import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createIoCoreTracingRepository } from "../io-core-tracing.repository.js";

vi.mock("@pagopa/io-core-adapter-tracing", () => ({
  emitCustomEvent: vi.fn(() => vi.fn()),
}));

describe("createIoCoreTracingRepository", () => {
  const emit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(emitCustomEvent).mockReturnValue(emit);
  });

  it("should emit a custom event using the payload caller as context", () => {
    const payload = { caller: "SomeCaller", data: { a: 1 } };

    createIoCoreTracingRepository().emitEvent("some.event", payload);

    expect(emitCustomEvent).toHaveBeenCalledWith("some.event", payload);
    expect(emit).toHaveBeenCalledWith("SomeCaller");
  });

  it("should emit start and end events around the function and return its result", async () => {
    const func = vi.fn().mockResolvedValue("done");

    const result = await createIoCoreTracingRepository().traceExecution(
      func,
      "SomeUseCase",
      "prod",
    );

    expect(result).toBe("done");
    expect(emitCustomEvent).toHaveBeenNthCalledWith(
      1,
      "use-case.tracing.start",
      {
        caller: "SomeUseCase",
        data: { message: expect.stringContaining("prod - Execution started") },
      },
    );
    expect(emitCustomEvent).toHaveBeenNthCalledWith(2, "use-case.tracing.end", {
      caller: "SomeUseCase",
      data: {
        duration: expect.stringMatching(/^\d+ms$/),
        message: expect.stringContaining("prod - Execution completed"),
      },
    });
    expect(emit).toHaveBeenCalledWith("SomeUseCase");
  });

  it("should not emit the end event when the function rejects", async () => {
    const failure = new Error("boom");

    await expect(
      createIoCoreTracingRepository().traceExecution(
        () => Promise.reject(failure),
        "SomeUseCase",
        "prod",
      ),
    ).rejects.toBe(failure);

    expect(emitCustomEvent).toHaveBeenCalledOnce();
  });
});
