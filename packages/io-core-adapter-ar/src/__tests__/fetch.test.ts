import { afterEach, describe, expect, it, vi } from "vitest";

import { createCustomFetch, customFetch } from "../fetch.js";

const testConfig = {
  baseUrl: "https://ar.example.com",
  subscriptionKey: "subscription-key",
};

describe("createCustomFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses json responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
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
    }>("/json", { method: "GET" });

    expect(response).toEqual(
      expect.objectContaining({ data: { ok: true }, status: 200 }),
    );
  });

  it("parses binary responses as blobs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("pdf-bytes", {
        headers: { "content-type": "application/pdf" },
        status: 200,
      }),
    );

    const fetch = createCustomFetch(testConfig);
    const response = await fetch<{
      data: Blob;
      headers: Headers;
      status: number;
    }>("/document-content/onboarding-id/contract-signed", { method: "GET" });

    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Blob);
    await expect(response.data.text()).resolves.toBe("pdf-bytes");
  });

  it("each instance uses its own config independently", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    const prodFetch = createCustomFetch({
      baseUrl: "https://prod.example.com",
      subscriptionKey: "prod-key",
    });
    const testFetch = createCustomFetch({
      baseUrl: "https://test.example.com",
      subscriptionKey: "test-key",
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
