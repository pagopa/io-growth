import type { SignedFetch } from "@pagopa/io-core-adapter-modi";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { InpsCedConfig } from "../config.js";

import { customFetch, identityStore, initInpsCedClient } from "../client.js";

// Shape expected from customFetch — mirrors what the adapter reads back.
interface FetchResult {
  data: unknown;
  headers: Headers;
  status: number;
}

const CONFIG: InpsCedConfig = {
  audience: "urn:test:gestione-ced",
  baseUrl: "https://api.collaudo.inps.it",
};

function makeResponse(status: number, data: unknown): Response {
  return {
    body: status !== 204 ? "x" : null,
    headers: new Headers({ "content-type": "application/json" }),
    json: vi.fn().mockResolvedValue(data),
    status,
  } as unknown as Response;
}

// Module-scoped mock — set up once, reset before each test.
const mockSignedFetch = vi.fn();

beforeAll(() => {
  mockSignedFetch.mockResolvedValue(makeResponse(200, {}));
  initInpsCedClient(CONFIG, mockSignedFetch as unknown as SignedFetch);
});

beforeEach(() => {
  mockSignedFetch.mockReset();
  mockSignedFetch.mockResolvedValue(makeResponse(200, {}));
});

// ─────────────────────────────────────────────────────────────────────────────
// Uninitialized state
// ─────────────────────────────────────────────────────────────────────────────
describe("when client is not initialized", () => {
  it("customFetch throws a descriptive error", async () => {
    // Fresh module instance (uninitialized globals) via vi.resetModules().
    // The static-import bindings above remain pointing to the original
    // initialized instance, so subsequent tests are unaffected.
    vi.resetModules();
    const { customFetch: fresh } = await import("../client.js");
    await expect(fresh("/path", { method: "GET" })).rejects.toThrow(
      "not initialised",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// customFetch behaviour
// ─────────────────────────────────────────────────────────────────────────────
describe("customFetch", () => {
  it("prepends config.baseUrl to the url path", async () => {
    await customFetch<FetchResult>("/Domanda/CheckDomanda", {
      body: "{}",
      method: "POST",
    });

    expect(mockSignedFetch).toHaveBeenCalledOnce();
    const [calledUrl] = mockSignedFetch.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe(`${CONFIG.baseUrl}/Domanda/CheckDomanda`);
  });

  it("sets Content-Type and Accept headers on the outgoing request", async () => {
    await customFetch<FetchResult>("/Domanda/CheckDomanda", {
      body: "{}",
      method: "POST",
    });

    const [, calledOptions] = mockSignedFetch.mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = calledOptions.headers as Record<string, string>;
    expect(headers["content-type"]).toBe("application/json");
    expect(headers["accept"]).toBe("application/json");
  });

  it("sets INPS-Identity headers when identity is present in the store", async () => {
    await identityStore.run(
      { codiceUfficio: "UFFICIO01", userId: "RSSMRA80A01H501U" },
      async () =>
        customFetch<FetchResult>("/Domanda/CheckDomanda", {
          body: "{}",
          method: "POST",
        }),
    );

    const [, calledOptions] = mockSignedFetch.mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = calledOptions.headers as Record<string, string>;
    expect(headers["inps-identity-userid"]).toBe("RSSMRA80A01H501U");
    expect(headers["inps-identity-codiceufficio"]).toBe("UFFICIO01");
  });

  it("does not set INPS-Identity headers when the store is empty", async () => {
    await customFetch<FetchResult>("/Domanda/CheckDomanda", {
      body: "{}",
      method: "POST",
    });

    const [, calledOptions] = mockSignedFetch.mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = calledOptions.headers as Record<string, string>;
    expect(headers["inps-identity-userid"]).toBeUndefined();
    expect(headers["inps-identity-codiceufficio"]).toBeUndefined();
  });

  it("returns { data, headers, status } for a response with a body", async () => {
    const responseData = { idLavorazione: "12345678901234567890" };
    mockSignedFetch.mockResolvedValue(makeResponse(200, responseData));

    const result = await customFetch<FetchResult>("/path", {
      body: "{}",
      method: "POST",
    });

    expect(result).toMatchObject({ data: responseData, status: 200 });
  });

  it("returns data: undefined for a 204 no-content response", async () => {
    mockSignedFetch.mockResolvedValue(makeResponse(204, null));

    const result = await customFetch<FetchResult>("/path", {
      body: "{}",
      method: "POST",
    });

    expect(result).toMatchObject({ data: undefined, status: 204 });
  });
});
