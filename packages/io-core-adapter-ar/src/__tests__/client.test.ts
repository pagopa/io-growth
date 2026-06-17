import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { customFetch, initArClient } from "../client.js";

const testConfig = {
  baseUrl: "https://ar.example.com",
  subscriptionKey: "subscription-key",
};

describe("customFetch", () => {
  beforeEach(() => {
    initArClient(() => testConfig);
  });

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

    const response = await customFetch<{
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

    const response = await customFetch<{
      data: Blob;
      headers: Headers;
      status: number;
    }>("/document-content/onboarding-id/contract-signed", { method: "GET" });

    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Blob);
    await expect(response.data.text()).resolves.toBe("pdf-bytes");
  });

  it("calls the getter on every request", async () => {
    const getter = vi.fn().mockReturnValue(testConfig);
    initArClient(getter);

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    await customFetch("/anything", { method: "GET" });
    await customFetch("/anything", { method: "GET" });

    expect(getter).toHaveBeenCalledTimes(2);
  });
});
