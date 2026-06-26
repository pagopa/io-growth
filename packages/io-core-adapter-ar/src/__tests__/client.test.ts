import { afterEach, describe, expect, it, vi } from "vitest";

import { customFetch, withArConfig } from "../client.js";

const testConfig = {
  baseUrl: "https://ar.example.com",
  subscriptionKey: "subscription-key",
};

describe("customFetch", () => {
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

    const response = await withArConfig(testConfig, () =>
      customFetch<{
        data: { ok: boolean };
        headers: Headers;
        status: number;
      }>("/json", { method: "GET" }),
    );

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

    const response = await withArConfig(testConfig, () =>
      customFetch<{
        data: Blob;
        headers: Headers;
        status: number;
      }>("/document-content/onboarding-id/contract-signed", { method: "GET" }),
    );

    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Blob);
    await expect(response.data.text()).resolves.toBe("pdf-bytes");
  });

  it("uses the bound config of the surrounding withArConfig scope", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await withArConfig(
      { baseUrl: "https://prod.example.com", subscriptionKey: "prod-key" },
      () => customFetch("/anything", { method: "GET" }),
    );
    await withArConfig(
      { baseUrl: "https://test.example.com", subscriptionKey: "test-key" },
      () => customFetch("/anything", { method: "GET" }),
    );

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

  it("throws when called outside a withArConfig scope", async () => {
    await expect(customFetch("/anything", { method: "GET" })).rejects.toThrow(
      "AR client config is not set",
    );
  });
});
