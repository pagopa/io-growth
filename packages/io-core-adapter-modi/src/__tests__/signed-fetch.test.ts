import { decodeJwt, decodeProtectedHeader, generateKeyPair } from "jose";
import { ok } from "neverthrow";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { ModiConfig } from "../config.js";
import type { ModiCredentialProvider } from "../domain/ports/outbound/credential-provider.port.js";

// ──────────────────────────────────────────────────────────────────────────────
// Mock undici fetch so no real network calls are made.
// We intercept at the module level before importing signed-fetch.
// ──────────────────────────────────────────────────────────────────────────────
vi.mock("undici", async (importOriginal) => {
  const actual = await importOriginal<typeof import("undici")>();
  return {
    ...actual,
    fetch: vi.fn(),
  };
});

import { fetch as mockFetch } from "undici";

import { createSignedFetch } from "../signed-fetch.js";

// ──────────────────────────────────────────────────────────────────────────────
// Test fixtures
// ──────────────────────────────────────────────────────────────────────────────
const CONFIG: ModiConfig = {
  codiceEnte: "pagopa-01",
  defaultCodiceUfficio: "UFFDEFAULT",
  environment: "collaudo",
  idTipoUtente: "01",
  inpsBaseUrl: "https://api.collaudo.inps.it",
  keyVaultUrl: "https://kv.example.com",
  secretNames: {
    httpsClientCert: "cert",
    httpsClientKey: "key",
    inpsHttpsCa: "inpsca",
    inpsSigningCa: "inpssigca",
    signingCert: "sigcert",
    signingKey: "sigkey",
  },
};

const AUDIENCE = "urn:inps:api:gestione-ced";

function makeOkResponse(extra: Record<string, string> = {}): Response {
  const headers = new Headers({ "Content-Type": "application/json", ...extra });
  return {
    body: null,
    headers,
    ok: true,
    status: 200,
  } as unknown as Response;
}

// Module-scoped credential provider — set up once before the whole suite.
let credentialProvider: ModiCredentialProvider;

beforeAll(async () => {
  const { privateKey } = await generateKeyPair("RS256");

  credentialProvider = {
    getHttpsClientCredentials: vi.fn().mockResolvedValue(
      ok({
        cert: "-----BEGIN CERTIFICATE-----\nFAKE\n-----END CERTIFICATE-----",
        key: "FAKE_KEY",
      }),
    ),
    getInpsHttpsCaChain: vi.fn().mockResolvedValue(ok("FAKE_CA")),
    getInpsSigningCaChain: vi
      .fn()
      .mockResolvedValue(
        ok("-----BEGIN CERTIFICATE-----\nFAKECA\n-----END CERTIFICATE-----"),
      ),
    getSigningCredentials: vi
      .fn()
      .mockResolvedValue(ok({ privateKey, x5c: ["MIIFAKE=="] })),
  };
});

beforeEach(() => {
  vi.mocked(mockFetch).mockReset();
  vi.mocked(mockFetch).mockResolvedValue(
    makeOkResponse() as unknown as Awaited<ReturnType<typeof mockFetch>>,
  );
});

// ──────────────────────────────────────────────────────────────────────────────
// Main test suite
// ──────────────────────────────────────────────────────────────────────────────
describe("createSignedFetch", () => {
  it("calls the underlying fetch with the prefixed full URL", async () => {
    const signedFetch = createSignedFetch({
      audience: AUDIENCE,
      config: CONFIG,
      credentialProvider,
    });

    await signedFetch("/Domanda/CheckDomanda", { body: "{}", method: "POST" });

    expect(vi.mocked(mockFetch)).toHaveBeenCalledOnce();
    const [calledUrl] = vi.mocked(mockFetch).mock.calls[0];
    expect(calledUrl).toBe(`${CONFIG.inpsBaseUrl}/Domanda/CheckDomanda`);
  });

  it("sets Digest header on the outgoing request", async () => {
    const signedFetch = createSignedFetch({
      audience: AUDIENCE,
      config: CONFIG,
      credentialProvider,
    });

    await signedFetch("/Domanda/CheckDomanda", {
      body: '{"codiceFiscale":"RSSMRA80A01H501U"}',
      method: "POST",
    });

    const [, calledOptions] = vi.mocked(mockFetch).mock.calls[0];
    const headers = calledOptions?.headers as Headers;
    expect(headers.get("Digest")).toMatch(/^SHA-256=/);
  });

  it("sets Agid-JWT-Signature header on the outgoing request", async () => {
    const signedFetch = createSignedFetch({
      audience: AUDIENCE,
      config: CONFIG,
      credentialProvider,
    });

    await signedFetch("/Domanda/CheckDomanda", { body: "{}", method: "POST" });

    const [, calledOptions] = vi.mocked(mockFetch).mock.calls[0];
    const headers = calledOptions?.headers as Headers;
    const jwt = headers.get("Agid-JWT-Signature");
    expect(jwt).toBeTruthy();

    // The JWT must carry the correct audience and issuer
    const payload = decodeJwt(String(jwt));
    expect(payload.aud).toContain(AUDIENCE);
    expect(payload.iss).toBe(CONFIG.codiceEnte);
  });

  it("includes x5c in the JWT protected header", async () => {
    const signedFetch = createSignedFetch({
      audience: AUDIENCE,
      config: CONFIG,
      credentialProvider,
    });

    await signedFetch("/Domanda/CheckDomanda", { body: "{}", method: "POST" });

    const [, calledOptions] = vi.mocked(mockFetch).mock.calls[0];
    const jwt = (calledOptions?.headers as Headers).get("Agid-JWT-Signature");
    expect(jwt).toBeTruthy();
    const header = decodeProtectedHeader(String(jwt));
    expect(header.x5c).toEqual(["MIIFAKE=="]);
  });

  it("sets INPS-Identity-UserId and falls back to defaultCodiceUfficio", async () => {
    const signedFetch = createSignedFetch({
      audience: AUDIENCE,
      config: CONFIG,
      credentialProvider,
    });

    await signedFetch("/Domanda/CheckDomanda", {
      body: "{}",
      headers: { "INPS-Identity-UserId": "RSSMRA80A01H501U" },
      method: "POST",
    });

    const [, calledOptions] = vi.mocked(mockFetch).mock.calls[0];
    const headers = calledOptions?.headers as Headers;
    expect(headers.get("INPS-Identity-UserId")).toBe("RSSMRA80A01H501U");
    expect(headers.get("INPS-Identity-CodiceUfficio")).toBe(
      CONFIG.defaultCodiceUfficio,
    );
  });

  it("uses caller-provided CodiceUfficio when present in headers", async () => {
    const signedFetch = createSignedFetch({
      audience: AUDIENCE,
      config: CONFIG,
      credentialProvider,
    });

    await signedFetch("/Domanda/CheckDomanda", {
      body: "{}",
      headers: {
        "INPS-Identity-CodiceUfficio": "UFFSPECIFICO",
        "INPS-Identity-UserId": "RSSMRA80A01H501U",
      },
      method: "POST",
    });

    const [, calledOptions] = vi.mocked(mockFetch).mock.calls[0];
    const headers = calledOptions?.headers as Headers;
    expect(headers.get("INPS-Identity-CodiceUfficio")).toBe("UFFSPECIFICO");
  });

  it("defaults Content-Type to application/json when not provided", async () => {
    const signedFetch = createSignedFetch({
      audience: AUDIENCE,
      config: CONFIG,
      credentialProvider,
    });

    await signedFetch("/Domanda/CheckDomanda", { body: "{}", method: "POST" });

    const [, calledOptions] = vi.mocked(mockFetch).mock.calls[0];
    const headers = calledOptions?.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("throws when credential provider returns an error", async () => {
    const { err } = await import("neverthrow");
    const { GenericError } = await import("@pagopa/io-core-domain/errors");

    const failingProvider: ModiCredentialProvider = {
      ...credentialProvider,
      getSigningCredentials: vi
        .fn()
        .mockResolvedValue(err(new GenericError("vault unavailable"))),
    };

    // New instance to avoid cached dispatcher from previous tests
    const signedFetch = createSignedFetch({
      audience: AUDIENCE,
      config: { ...CONFIG, inpsBaseUrl: "https://api2.collaudo.inps.it" },
      credentialProvider: failingProvider,
    });

    await expect(
      signedFetch("/Domanda/CheckDomanda", { body: "{}", method: "POST" }),
    ).rejects.toThrow("vault unavailable");
  });

  it("does not throw when response has no Agid-JWT-Signature (P3 verify skipped)", async () => {
    const signedFetch = createSignedFetch({
      audience: AUDIENCE,
      config: { ...CONFIG, inpsBaseUrl: "https://api3.collaudo.inps.it" },
      credentialProvider,
    });

    await expect(
      signedFetch("/Domanda/CheckDomanda", { body: "{}", method: "POST" }),
    ).resolves.toBeDefined();
  });

  it("throws when response contains Agid-JWT-Signature but cert chain is invalid", async () => {
    // The credential provider returns a fake PEM that cannot be parsed as a real
    // X.509 certificate; importX509 will throw inside the verifier, which returns
    // err(UnauthorizedError), and signedFetch rethrows it.
    vi.mocked(mockFetch).mockResolvedValueOnce(
      makeOkResponse({
        "Agid-JWT-Signature": "fake.jwt.token",
      }) as unknown as Awaited<ReturnType<typeof mockFetch>>,
    );

    const signedFetch = createSignedFetch({
      audience: AUDIENCE,
      config: { ...CONFIG, inpsBaseUrl: "https://api4.collaudo.inps.it" },
      credentialProvider,
    });

    await expect(
      signedFetch("/Domanda/CheckDomanda", { body: "{}", method: "POST" }),
    ).rejects.toThrow();
  });
});
