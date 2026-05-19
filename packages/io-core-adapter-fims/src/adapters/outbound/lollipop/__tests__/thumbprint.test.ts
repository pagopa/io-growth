import { ok } from "neverthrow";
import { describe, expect, it } from "vitest";

import { calculateThumbprint, getAlgoFromAssertionRef } from "../thumbprint.js";

describe("getAlgoFromAssertionRef", () => {
  it('returns "sha256" for a sha256- prefixed ref', () => {
    expect(getAlgoFromAssertionRef("sha256-abcdef")).toBe("sha256");
  });

  it('returns "sha384" for a sha384- prefixed ref', () => {
    expect(getAlgoFromAssertionRef("sha384-abcdef")).toBe("sha384");
  });

  it('returns "sha512" for a sha512- prefixed ref', () => {
    expect(getAlgoFromAssertionRef("sha512-abcdef")).toBe("sha512");
  });

  it('defaults to "sha256" for unknown prefix', () => {
    expect(getAlgoFromAssertionRef("md5-abcdef")).toBe("sha256");
  });
});

describe("calculateThumbprint", () => {
  // RFC 7638 example JWK — the thumbprint for this key with sha256
  // is NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs (from RFC 7638 §3.1)
  const jwk = {
    e: "AQAB",
    kty: "RSA",
    n: "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw",
  };

  it("calculates the correct sha256 thumbprint for an RSA JWK", async () => {
    const result = await calculateThumbprint(jwk, "sha256");
    // The RFC example thumbprint
    expect(result).toEqual(ok("NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs"));
  });

  it("returns GenericError for an invalid JWK", async () => {
    const result = await calculateThumbprint({ kty: "INVALID" }, "sha256");
    expect(result.isErr()).toBe(true);
  });
});
