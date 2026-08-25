import { generateKeyPair, importX509, SignJWT } from "jose";
import { beforeAll, describe, expect, it, vi } from "vitest";

// vi.mock() is hoisted before imports — we replace importX509 with a fn
// that returns our in-memory CryptoKey (set by beforeAll) so tests work
// without needing a real X.509 DER certificate.
vi.mock("jose", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jose")>();
  return {
    ...actual,
    // Closure reads sharedPublicKey when called, after beforeAll has run.
    importX509: vi.fn(async () => sharedPublicKey),
  };
});

// Module-scoped variables populated by beforeAll before any test runs.
let sharedPublicKey: CryptoKey;
let sharedPrivateKey: CryptoKey;

const SENT_DIGEST = "SHA-256=abc123base64==";
const FAKE_CERT_CHAIN =
  "-----BEGIN CERTIFICATE-----\nMIIFAKECERT\n-----END CERTIFICATE-----\n";

async function makeSignedJwt(
  privateKey: CryptoKey,
  extraClaims: Record<string, unknown> = {},
): Promise<string> {
  return new SignJWT({ request_digest: SENT_DIGEST, ...extraClaims })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
}

import { createResponseVerifier } from "../jose-response-verifier.js";

describe("createResponseVerifier", () => {
  beforeAll(async () => {
    const kp = await generateKeyPair("RS256");
    sharedPrivateKey = kp.privateKey as CryptoKey;
    sharedPublicKey = kp.publicKey as CryptoKey;
  });

  it("returns ok when JWT signature is valid and request_digest matches", async () => {
    const verifier = createResponseVerifier(FAKE_CERT_CHAIN);
    const jwt = await makeSignedJwt(sharedPrivateKey);
    const result = await verifier.verify(jwt, SENT_DIGEST);

    expect(result.isOk()).toBe(true);
  });

  it("returns err(UnauthorizedError) when request_digest claim does not match sent digest", async () => {
    const verifier = createResponseVerifier(FAKE_CERT_CHAIN);
    const jwt = await makeSignedJwt(sharedPrivateKey, {
      request_digest: "SHA-256=DIFFERENT==",
    });
    const result = await verifier.verify(jwt, SENT_DIGEST);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error.kind).toBe("UnauthorizedError");
    expect(error.message).toContain("mismatch");
  });

  it("returns err(UnauthorizedError) when request_digest claim is missing", async () => {
    const verifier = createResponseVerifier(FAKE_CERT_CHAIN);
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(sharedPrivateKey);

    const result = await verifier.verify(jwt, SENT_DIGEST);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("UnauthorizedError");
  });

  it("returns err(UnauthorizedError) when JWT signature is invalid (tampered)", async () => {
    const verifier = createResponseVerifier(FAKE_CERT_CHAIN);
    const goodJwt = await makeSignedJwt(sharedPrivateKey);
    const parts = goodJwt.split(".");
    parts[2] = parts[2].split("").reverse().join("");
    const tamperedJwt = parts.join(".");

    const result = await verifier.verify(tamperedJwt, SENT_DIGEST);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("UnauthorizedError");
  });

  it("returns err(UnauthorizedError) when the CA chain contains no certificate", async () => {
    vi.mocked(importX509).mockRejectedValueOnce(
      new Error("no certificate found"),
    );
    const emptyChainVerifier = createResponseVerifier("no cert here at all");
    const jwt = await makeSignedJwt(sharedPrivateKey);

    const result = await emptyChainVerifier.verify(jwt, SENT_DIGEST);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toContain("no certificate");
  });
});
