import { afterEach, describe, expect, it, vi } from "vitest";

import { createCustomFetch, customFetch } from "../fetch.js";

const testConfig = {
  apiKey: "api-key",
  baseUrl: "https://onemail.example.com",
};

describe("createCustomFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses json responses and sets the x-api-key header", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );

    const fetch = createCustomFetch(testConfig);
    const response = await fetch<{
      data: { ok: boolean };
      headers: Headers;
      status: number;
    }>("/v1/emails/statuses", { method: "GET" });

    expect(response).toEqual(
      expect.objectContaining({ data: { ok: true }, status: 200 }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://onemail.example.com/v1/emails/statuses",
      expect.objectContaining({ method: "GET" }),
    );
    const headers = fetchSpy.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("x-api-key")).toBe("api-key");
  });

  it("returns undefined data for empty (204) responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    const fetch = createCustomFetch(testConfig);
    const response = await fetch<{ data: unknown; status: number }>(
      "/anything",
      { method: "DELETE" },
    );

    expect(response.status).toBe(204);
    expect(response.data).toBeUndefined();
  });

  it("each instance uses its own config independently", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    const prodFetch = createCustomFetch({
      apiKey: "prod-key",
      baseUrl: "https://prod.example.com",
    });
    const testFetch = createCustomFetch({
      apiKey: "test-key",
      baseUrl: "https://test.example.com",
    });

    await prodFetch("/anything", { method: "GET" });
    await testFetch("/anything", { method: "GET" });

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "https://prod.example.com/anything",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "https://test.example.com/anything",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("customFetch", () => {
  it("throws when called directly (must use createCustomFetch instead)", async () => {
    await expect(customFetch("/anything", { method: "GET" })).rejects.toThrow(
      "createCustomFetch()",
    );
  });
});
