import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../generated/endpoints/health/health.js", () => ({
  getGetHealthReadyUrl: vi.fn(() => "/health/ready"),
  getGetHealthUrl: vi.fn(() => "/health"),
}));

import { createHealthClient } from "../health.js";

function makeResponse<T>(status: number, data: T) {
  return { data, headers: new Headers(), status } as {
    data: T;
    headers: Headers;
    status: number;
  };
}

const customFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkLiveness", () => {
  it("returns ok(data) on 200", async () => {
    const data = { status: "Healthy", timestamp: "now", uptime: 1 };
    customFetch.mockResolvedValue(makeResponse(200, data));

    const adapter = createHealthClient(customFetch);
    const result = await adapter.checkLiveness();

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(data);
  });

  it("returns err(GenericError) on non-200", async () => {
    customFetch.mockResolvedValue(makeResponse(500, undefined));

    const adapter = createHealthClient(customFetch);
    const result = await adapter.checkLiveness();

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
  });

  it("returns err(GenericError) when customFetch throws", async () => {
    customFetch.mockRejectedValue(new Error("network down"));

    const adapter = createHealthClient(customFetch);
    const result = await adapter.checkLiveness();

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
  });
});

describe("checkReadiness", () => {
  it("returns ok(data) on 200", async () => {
    const data = {
      services: {
        db: "Initialized",
        queue: { highPriority: "Initialized", lowPriority: "Initialized" },
      },
      status: "Healthy",
      timestamp: "now",
      uptime: 1,
    };
    customFetch.mockResolvedValue(makeResponse(200, data));

    const adapter = createHealthClient(customFetch);
    const result = await adapter.checkReadiness();

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(data);
  });

  it("returns err(GenericError) on non-200", async () => {
    customFetch.mockResolvedValue(makeResponse(503, undefined));

    const adapter = createHealthClient(customFetch);
    const result = await adapter.checkReadiness();

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
  });
});
