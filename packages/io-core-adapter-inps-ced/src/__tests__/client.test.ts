import type { SignedFetch } from "@pagopa/io-core-adapter-modi";

import { ok } from "neverthrow";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { InpsIdentityContext } from "../client.js";
import type { InpsCedConfig } from "../config.js";

import { customFetch, initInpsCedClient } from "../client.js";

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
    status,
    text: vi.fn().mockResolvedValue(data !== null ? JSON.stringify(data) : ""),
  } as unknown as Response;
}

/**
 * Builds a Response whose body is a real ReadableStream. When `terminatedAfter`
 * is provided, the stream enqueues the payload and then errors with a
 * `TypeError: terminated` — reproducing undici's behaviour when INPS closes the
 * mTLS connection without a clean close_notify after a 4xx.
 */
function makeStreamedResponse(
  status: number,
  rawBody: string,
  options: { terminated?: boolean } = {},
): Response {
  const encoder = new TextEncoder();
  let chunkSent = false;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (!chunkSent) {
        chunkSent = true;
        if (rawBody) controller.enqueue(encoder.encode(rawBody));
        return;
      }
      if (options.terminated) {
        const error = new TypeError("terminated");
        (error as { cause?: unknown }).cause = new Error("other side closed");
        controller.error(error);
        return;
      }
      controller.close();
    },
  });

  return {
    body: stream,
    headers: new Headers({
      "content-length": String(encoder.encode(rawBody).byteLength),
      "content-type": "application/json",
    }),
    status,
    text: vi.fn().mockRejectedValue(new TypeError("terminated")),
  } as unknown as Response;
}

// Module-scoped mock — set up once, reset before each test.
const mockSignedFetch = vi.fn();

// Mutable getter — tests can swap the returned identity per-case.
let mockGetIdentity: () => InpsIdentityContext | undefined = () => undefined;

beforeAll(() => {
  mockSignedFetch.mockResolvedValue(ok(makeResponse(200, {})));
  // Pass a stable wrapper so tests can change `mockGetIdentity` between calls.
  initInpsCedClient(CONFIG, mockSignedFetch as unknown as SignedFetch, () =>
    mockGetIdentity(),
  );
});

beforeEach(() => {
  mockSignedFetch.mockReset();
  mockSignedFetch.mockResolvedValue(ok(makeResponse(200, {})));
  mockGetIdentity = () => undefined;
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

  it("requests an identity (uncompressed) response so error payloads stay readable", async () => {
    await customFetch<FetchResult>("/Domanda/CheckDomanda", {
      body: "{}",
      method: "POST",
    });

    const [, calledOptions] = mockSignedFetch.mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = calledOptions.headers as Record<string, string>;
    expect(headers["accept-encoding"]).toBe("identity");
  });

  it("sets INPS-Identity headers when the getter returns an identity", async () => {
    mockGetIdentity = () => ({
      codiceUfficio: "UFFICIO01",
      userId: "RSSMRA80A01H501U",
    });

    await customFetch<FetchResult>("/Domanda/CheckDomanda", {
      body: "{}",
      method: "POST",
    });

    const [, calledOptions] = mockSignedFetch.mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = calledOptions.headers as Record<string, string>;
    expect(headers["inps-identity-userid"]).toBe("RSSMRA80A01H501U");
    expect(headers["inps-identity-codiceufficio"]).toBe("UFFICIO01");
  });

  it("does not set INPS-Identity headers when the getter returns undefined", async () => {
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
    mockSignedFetch.mockResolvedValue(ok(makeResponse(200, responseData)));

    const result = await customFetch<FetchResult>("/path", {
      body: "{}",
      method: "POST",
    });

    expect(result).toMatchObject({ data: responseData, status: 200 });
  });

  it("returns data: undefined for a 204 no-content response", async () => {
    mockSignedFetch.mockResolvedValue(ok(makeResponse(204, null)));

    const result = await customFetch<FetchResult>("/path", {
      body: "{}",
      method: "POST",
    });

    expect(result).toMatchObject({ data: undefined, status: 204 });
  });

  it("recovers a fully-received body when the connection is terminated after a 4xx", async () => {
    const problemDetails = {
      errors: [
        {
          Codice: 204,
          Descrizione:
            "Data nascita non corrispondente negli archivi dell'Istituto.",
        },
      ],
      instance: "/Domanda/NuovaDomandaInBozza",
      status: 400,
      title: "Bad Request",
      type: "about:blank",
    };
    mockSignedFetch.mockResolvedValue(
      ok(
        makeStreamedResponse(400, JSON.stringify(problemDetails), {
          terminated: true,
        }),
      ),
    );

    const result = await customFetch<FetchResult>("/path", {
      body: "{}",
      method: "POST",
    });

    expect(result).toMatchObject({ data: problemDetails, status: 400 });
  });

  it("returns data: undefined when a terminated body is truncated (unparseable)", async () => {
    mockSignedFetch.mockResolvedValue(
      ok(makeStreamedResponse(400, '{"status":400,"err', { terminated: true })),
    );

    const result = await customFetch<FetchResult>("/path", {
      body: "{}",
      method: "POST",
    });

    expect(result).toMatchObject({ data: undefined, status: 400 });
  });

  it("throws when a 2xx response body is terminated mid-read", async () => {
    mockSignedFetch.mockResolvedValue(
      ok(
        makeStreamedResponse(200, '{"idLavorazione":"1', { terminated: true }),
      ),
    );

    await expect(
      customFetch<FetchResult>("/path", { body: "{}", method: "POST" }),
    ).rejects.toThrow("terminated");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Telemetry on non-2xx responses
// ─────────────────────────────────────────────────────────────────────────────
describe("customFetch telemetry", () => {
  const trackException = vi.fn();

  beforeAll(() => {
    initInpsCedClient(
      CONFIG,
      mockSignedFetch as unknown as SignedFetch,
      () => mockGetIdentity(),
      { trackException },
    );
  });

  beforeEach(() => {
    trackException.mockReset();
  });

  it("traces the recovered INPS payload for a terminated 4xx response", async () => {
    const problemDetails = {
      errors: [
        { Codice: 204, Descrizione: "Data nascita non corrispondente." },
      ],
      status: 400,
      title: "Bad Request",
    };
    mockSignedFetch.mockResolvedValue(
      ok(
        makeStreamedResponse(400, JSON.stringify(problemDetails), {
          terminated: true,
        }),
      ),
    );

    await customFetch<FetchResult>("/path", { body: "{}", method: "POST" });

    expect(trackException).toHaveBeenCalledOnce();
    const [{ error }] = trackException.mock.calls[0] as [{ error: Error }];
    expect(error.message).toContain("HTTP 400 from upstream");
    expect(error.message).toContain('"Codice":204');
    expect(error.message).toContain("connection terminated");
  });

  it("traces the payload for a cleanly-received non-2xx response", async () => {
    mockSignedFetch.mockResolvedValue(
      ok(makeStreamedResponse(404, '{"title":"Not Found"}')),
    );

    await customFetch<FetchResult>("/path", { body: "{}", method: "POST" });

    expect(trackException).toHaveBeenCalledOnce();
    const [{ error }] = trackException.mock.calls[0] as [{ error: Error }];
    expect(error.message).toContain("HTTP 404 from upstream");
    expect(error.message).toContain('"title":"Not Found"');
    expect(error.message).not.toContain("connection terminated");
  });
});
