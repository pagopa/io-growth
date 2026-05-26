import { afterEach, describe, expect, it, vi } from "vitest";

import { customFetch, initArClient } from "../fetcher.js";

describe("customFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses json responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      }),
    );

    initArClient({
      baseUrl: "https://ar.example.com",
      subscriptionKey: "subscription-key",
    });

    const response = await customFetch<{
      data: { ok: boolean };
      headers: Headers;
      status: number;
    }>("/json", {
      method: "GET",
    });

    expect(response).toEqual(
      expect.objectContaining({
        data: { ok: true },
        status: 200,
      }),
    );
  });

  it("parses binary responses as blobs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("pdf-bytes", {
        headers: {
          "content-type": "application/pdf",
        },
        status: 200,
      }),
    );

    initArClient({
      baseUrl: "https://ar.example.com",
      subscriptionKey: "subscription-key",
    });

    const response = await customFetch<{
      data: Blob;
      headers: Headers;
      status: number;
    }>("/document-content/onboarding-id/contract-signed", {
      method: "GET",
    });

    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Blob);
    await expect(response.data.text()).resolves.toBe("pdf-bytes");
  });
});
